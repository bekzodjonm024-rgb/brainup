import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decideNextAction } from "@/lib/modules/adaptive/engine";

const ACTION_PRIORITY: Record<string, number> = {
  PREREQUISITE: 5,
  RETRIEVE: 4,
  EXPLAIN_AGAIN: 3,
  PRACTICE: 2,
  ADVANCED_PRACTICE: 2,
  CONTINUE: 1,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const studentId = session.user.profileId;

  const enrollments = await db.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          topics: {
            orderBy: { orderIndex: "asc" },
            include: {
              learnerKnowledge: { where: { studentId }, take: 1 },
            },
          },
        },
      },
    },
  });

  // Gather all topics that have been started
  const topicIds = enrollments
    .flatMap((e) => e.course.topics)
    .filter((t) => t.learnerKnowledge.length > 0)
    .map((t) => t.id);

  // Also pick first unstarted topic per course as a "start" recommendation
  const unstartedTopics = enrollments.flatMap((e) => {
    const first = e.course.topics.find((t) => t.learnerKnowledge.length === 0);
    return first ? [{ topic: first, courseTitle: e.course.title }] : [];
  });

  // Batch fetch recent attempts and retention records for started topics
  const [recentAttempts, retentionRecords] = await Promise.all([
    db.attempt.findMany({
      where: { studentId, question: { topicId: { in: topicIds } } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { questionId: true, isCorrect: true, question: { select: { topicId: true } } },
    }),
    db.retrievalRecord.findMany({
      where: { studentId, topicId: { in: topicIds }, status: "PENDING" },
      select: { topicId: true, dueAt: true },
    }),
  ]);

  const attemptsByTopic = new Map<string, { isCorrect: boolean }[]>();
  for (const a of recentAttempts) {
    const tid = a.question.topicId;
    if (!attemptsByTopic.has(tid)) attemptsByTopic.set(tid, []);
    attemptsByTopic.get(tid)!.push({ isCorrect: a.isCorrect });
  }

  const retentionByTopic = new Map<string, Date>();
  for (const r of retentionRecords) {
    if (!retentionByTopic.has(r.topicId) || r.dueAt < retentionByTopic.get(r.topicId)!) {
      retentionByTopic.set(r.topicId, r.dueAt);
    }
  }

  interface Recommendation {
    topicId: string;
    topicTitle: string;
    courseTitle: string;
    action: string;
    reason: string;
    mastery: number;
    priority: number;
  }

  const recommendations: Recommendation[] = [];

  for (const enrollment of enrollments) {
    for (const topic of enrollment.course.topics) {
      const knowledge = topic.learnerKnowledge[0];
      if (!knowledge) continue;

      const attempts = attemptsByTopic.get(topic.id) ?? [];
      const repeatedErrors = attempts.slice(0, 6).filter((a) => !a.isCorrect).length;
      const retentionDue = retentionByTopic.has(topic.id) &&
        retentionByTopic.get(topic.id)! <= new Date()
        ? knowledge.retrievalScore
        : 0;

      const decision = decideNextAction({
        masteryScore: knowledge.masteryScore,
        recentAccuracy: knowledge.recentAccuracy,
        repeatedErrors,
        retentionScore: retentionDue,
        attemptsOnTopic: knowledge.attempts,
      });

      recommendations.push({
        topicId: topic.id,
        topicTitle: topic.title,
        courseTitle: enrollment.course.title,
        action: decision.action,
        reason: decision.reason,
        mastery: knowledge.masteryScore,
        priority: ACTION_PRIORITY[decision.action] ?? 0,
      });
    }
  }

  // Add unstarted topics as low-priority "start" recommendations
  for (const { topic, courseTitle } of unstartedTopics) {
    recommendations.push({
      topicId: topic.id,
      topicTitle: topic.title,
      courseTitle,
      action: "START",
      reason: "Bu mavzu hali boshlanmagan",
      mastery: 0,
      priority: 0,
    });
  }

  // Sort by priority desc, then mastery asc (lower mastery = more urgent)
  recommendations.sort((a, b) =>
    b.priority !== a.priority ? b.priority - a.priority : a.mastery - b.mastery
  );

  return NextResponse.json({ recommendations: recommendations.slice(0, 5) });
}
