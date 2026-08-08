import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scoreAssessment } from "@/lib/modules/assessment/scorer";
import type { RawResponse } from "@/lib/modules/assessment/types";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const assessmentSession = await db.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: { item: true },
      },
    },
  });

  if (!assessmentSession || assessmentSession.studentId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }
  if (assessmentSession.status === "COMPLETED") {
    return NextResponse.json({ error: "Allaqachon tugallangan" }, { status: 400 });
  }

  // Build raw responses for scoring
  const rawResponses: RawResponse[] = assessmentSession.answers.map((ans) => {
    const given = ans.givenAnswer as Record<string, unknown>;
    return {
      taskType: ans.item.taskType as RawResponse["taskType"],
      category: ans.item.category as RawResponse["category"],
      ...given,
    } as RawResponse;
  });

  const scores = scoreAssessment(rawResponses);

  // Prisma Json fields require explicit cast
  const rawAsJson = (v: unknown) => v as Parameters<typeof db.cognitiveProfile.upsert>[0]["create"]["attentionRaw"];

  // Create or update cognitive profile FIRST — if this fails, session stays IN_PROGRESS
  // so the student can retry without getting stuck in a completed-but-no-profile state.
  const profile = await db.cognitiveProfile.upsert({
    where: { studentId: session.user.profileId },
    update: {
      assessmentSessionId: sessionId,
      attentionScore: scores.attention,
      workingMemoryScore: scores.workingMemory,
      processingSpeedScore: scores.processingSpeed,
      memoryScore: scores.memory,
      attentionRaw: rawAsJson(scores.raw.attention),
      workingMemoryRaw: rawAsJson(scores.raw.workingMemory),
      processingSpeedRaw: rawAsJson(scores.raw.processingSpeed),
      memoryRaw: rawAsJson(scores.raw.memory),
    },
    create: {
      studentId: session.user.profileId,
      assessmentSessionId: sessionId,
      attentionScore: scores.attention,
      workingMemoryScore: scores.workingMemory,
      processingSpeedScore: scores.processingSpeed,
      memoryScore: scores.memory,
      attentionRaw: rawAsJson(scores.raw.attention),
      workingMemoryRaw: rawAsJson(scores.raw.workingMemory),
      processingSpeedRaw: rawAsJson(scores.raw.processingSpeed),
      memoryRaw: rawAsJson(scores.raw.memory),
    },
  });

  // Mark session as completed only after profile is safely persisted
  await db.assessmentSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  // Log event — non-critical, swallow errors
  try {
    await db.learningEvent.create({
      data: { studentId: session.user.profileId, eventType: "ASSESSMENT_COMPLETED" },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ scores, profileId: profile.id });
}
