import { db } from "@/lib/db";
import {
  calculateMastery,
  updateRecentAccuracy,
  updateHistoricalAccuracy,
  calculateConsistency,
} from "./calculator";
import { getInitialReviewDate } from "@/lib/modules/retrieval/scheduler";

export async function updateLearnerKnowledge(
  studentId: string,
  topicId: string,
  isCorrect: boolean
) {
  // Get or create knowledge record
  const existing = await db.learnerKnowledge.findUnique({
    where: { studentId_topicId: { studentId, topicId } },
  });

  const prev = existing ?? {
    masteryScore: 0,
    recentAccuracy: 0,
    historicalAccuracy: 0,
    retrievalScore: 0,
    consistencyScore: 0,
    attempts: 0,
    correctAttempts: 0,
  };

  const newAttempts = prev.attempts + 1;
  const newCorrect = prev.correctAttempts + (isCorrect ? 1 : 0);

  const newRecent = updateRecentAccuracy(prev.recentAccuracy, isCorrect);
  const newHistorical = updateHistoricalAccuracy(newCorrect, newAttempts);

  // Consistency: track last 5 session accuracies (simplified: use recent + historical)
  const recentScores = [newRecent, prev.recentAccuracy, prev.historicalAccuracy].filter(Boolean);
  const newConsistency = calculateConsistency(recentScores);

  const masteryResult = calculateMastery({
    recentAccuracy: newRecent,
    historicalAccuracy: newHistorical,
    retrievalScore: prev.retrievalScore,
    consistencyScore: newConsistency,
  });

  const now = new Date();

  if (existing) {
    await db.learnerKnowledge.update({
      where: { studentId_topicId: { studentId, topicId } },
      data: {
        masteryScore: masteryResult.score,
        recentAccuracy: newRecent,
        historicalAccuracy: newHistorical,
        consistencyScore: newConsistency,
        attempts: newAttempts,
        correctAttempts: newCorrect,
        lastPracticedAt: now,
      },
    });
  } else {
    await db.learnerKnowledge.create({
      data: {
        studentId,
        topicId,
        masteryScore: masteryResult.score,
        recentAccuracy: newRecent,
        historicalAccuracy: newHistorical,
        consistencyScore: newConsistency,
        attempts: newAttempts,
        correctAttempts: newCorrect,
        lastPracticedAt: now,
      },
    });
  }

  // Schedule retrieval if newly mastered
  const wasMastered = (existing?.masteryScore ?? 0) >= 0.85;
  const nowMastered = masteryResult.score >= 0.85;

  if (nowMastered && !wasMastered) {
    const existingRetrieval = await db.retrievalRecord.findFirst({
      where: { studentId, topicId, status: "PENDING" },
    });
    if (!existingRetrieval) {
      const dueDate = getInitialReviewDate();
      await db.retrievalRecord.create({
        data: {
          studentId,
          topicId,
          scheduledAt: now,
          dueAt: dueDate,
          intervalDays: 3,
          nextIntervalDays: 7,
        },
      });
    }

    await db.learningEvent.create({
      data: { studentId, topicId, eventType: "TOPIC_MASTERED" },
    });
  }

  return masteryResult;
}
