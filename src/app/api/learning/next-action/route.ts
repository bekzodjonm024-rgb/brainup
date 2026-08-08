import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import { Intervention } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  if (!topicId) return NextResponse.json({ error: "topicId kerak" }, { status: 400 });

  const studentId = session.user.profileId;

  const [knowledge, recentAttempts, retentionRecord] = await Promise.all([
    db.learnerKnowledge.findUnique({
      where: { studentId_topicId: { studentId, topicId } },
    }),
    db.attempt.findMany({
      where: { studentId, question: { topicId } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { isCorrect: true },
    }),
    db.retrievalRecord.findFirst({
      where: { studentId, topicId, status: "PENDING" },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  const mastery = knowledge?.masteryScore ?? 0;
  const repeatedErrors = recentAttempts.filter((a) => !a.isCorrect).length;
  const retentionScore = knowledge?.retrievalScore ?? 0;
  const retentionDue =
    retentionRecord && retentionRecord.dueAt <= new Date()
      ? retentionScore
      : 0;

  const decision = decideNextAction({
    masteryScore: mastery,
    recentAccuracy: knowledge?.recentAccuracy ?? 0,
    repeatedErrors,
    retentionScore: retentionDue,
    attemptsOnTopic: knowledge?.attempts ?? 0,
  });

  // Log intervention
  await db.intervention.create({
    data: {
      studentId,
      topicId,
      action: decision.action,
      reason: decision.reason,
    },
  });

  // Get next topic in course if CONTINUE
  let nextTopic = null;
  if (decision.action === "CONTINUE") {
    const currentTopic = await db.topic.findUnique({
      where: { id: topicId },
      select: { courseId: true, orderIndex: true },
    });
    if (currentTopic) {
      nextTopic = await db.topic.findFirst({
        where: {
          courseId: currentTopic.courseId,
          orderIndex: { gt: currentTopic.orderIndex },
        },
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true },
      });
    }
  }

  // Get prerequisite if needed
  let prerequisiteTopic = null;
  if (decision.action === "PREREQUISITE") {
    prerequisiteTopic = await db.topic.findFirst({
      where: { id: topicId },
      select: { prerequisiteTopic: { select: { id: true, title: true } } },
    }).then((t) => t?.prerequisiteTopic ?? null);
  }

  return NextResponse.json({
    action: decision.action,
    reason: decision.reason,
    mastery,
    nextTopic,
    prerequisiteTopic,
    topicId,
  });
}
