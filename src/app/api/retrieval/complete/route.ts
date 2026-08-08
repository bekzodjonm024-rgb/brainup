import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextInterval, addDays } from "@/lib/modules/retrieval/scheduler";
import { z } from "zod";

const schema = z.object({
  recordId: z.string(),
  topicId: z.string(),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { recordId, topicId, correctCount, totalCount } = parsed.data;
  const studentId = session.user.profileId;

  const record = await db.retrievalRecord.findUnique({
    where: { id: recordId },
  });

  if (!record || record.studentId !== studentId) {
    return NextResponse.json({ error: "Yozuv topilmadi" }, { status: 404 });
  }

  const retrievalAccuracy = correctCount / totalCount;
  const wasGood = retrievalAccuracy >= 0.7;
  const nextIntervalDays = getNextInterval(record.intervalDays, wasGood);
  const now = new Date();
  const nextDueDate = addDays(now, nextIntervalDays);

  // Mark current record as completed
  await db.retrievalRecord.update({
    where: { id: recordId },
    data: {
      status: "COMPLETED",
      completedAt: now,
      score: retrievalAccuracy,
    },
  });

  // Schedule next retrieval (only if not already mastery-forgotten)
  if (retrievalAccuracy >= 0.4) {
    await db.retrievalRecord.create({
      data: {
        studentId,
        topicId,
        scheduledAt: now,
        dueAt: nextDueDate,
        intervalDays: nextIntervalDays,
        nextIntervalDays: getNextInterval(nextIntervalDays, true),
      },
    });
  }

  // Update learnerKnowledge: retrievalScore (EMA alpha=0.4) + lastRetrievedAt
  const knowledge = await db.learnerKnowledge.findUnique({
    where: { studentId_topicId: { studentId, topicId } },
  });

  if (knowledge) {
    const newRetrievalScore = knowledge.retrievalScore * 0.6 + retrievalAccuracy * 0.4;

    // Recalculate mastery with updated retrieval score
    const masteryScore =
      0.4 * knowledge.recentAccuracy +
      0.25 * knowledge.historicalAccuracy +
      0.2 * newRetrievalScore +
      0.15 * knowledge.consistencyScore;

    await db.learnerKnowledge.update({
      where: { studentId_topicId: { studentId, topicId } },
      data: {
        retrievalScore: newRetrievalScore,
        masteryScore: Math.min(1, Math.max(0, masteryScore)),
        lastRetrievedAt: now,
        nextReviewAt: nextDueDate,
      },
    });
  }

  // Log event
  await db.learningEvent.create({
    data: {
      studentId,
      topicId,
      eventType: "RETRIEVAL_COMPLETED",
      payload: { correctCount, totalCount, retrievalAccuracy, nextIntervalDays },
    },
  });

  return NextResponse.json({
    retrievalScore: retrievalAccuracy,
    nextIntervalDays,
    nextReviewDate: nextDueDate.toISOString(),
    scheduled: retrievalAccuracy >= 0.4,
  });
}
