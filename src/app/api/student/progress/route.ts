import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = session.user.profileId;

  const student = await db.student.findUnique({
    where: { id: studentId },
    select: {
      firstName: true,
      lastName: true,
      groupName: true,
      yearLevel: true,
      cognitiveProfile: true,
      enrollments: {
        select: {
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
              topics: {
                select: {
                  id: true,
                  title: true,
                  orderIndex: true,
                  learnerKnowledge: {
                    where: { studentId },
                    select: {
                      masteryScore: true,
                      recentAccuracy: true,
                      attempts: true,
                      lastStudiedAt: true,
                    },
                    take: 1,
                  },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
        orderBy: { enrolledAt: "asc" },
      },
      attempts: {
        select: { isCorrect: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      },
      retrievalRecords: {
        select: { status: true, dueAt: true, completedAt: true },
      },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalAttempts = student.attempts.length;
  const correctAttempts = student.attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  const retrievalDone = student.retrievalRecords.filter((r) => r.status === "COMPLETED").length;
  const retrievalPending = student.retrievalRecords.filter(
    (r) => r.status === "PENDING" && new Date(r.dueAt) <= new Date()
  ).length;
  const retrievalUpcoming = student.retrievalRecords.filter(
    (r) => r.status === "PENDING" && new Date(r.dueAt) > new Date()
  ).length;

  const allKnowledge = student.enrollments.flatMap((e) =>
    e.course.topics.flatMap((t) => t.learnerKnowledge)
  );
  const avgMastery = allKnowledge.length
    ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
    : 0;
  const masteredTopics = allKnowledge.filter((k) => k.masteryScore >= 0.85).length;

  return NextResponse.json({
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      groupName: student.groupName,
      yearLevel: student.yearLevel,
    },
    cognitiveProfile: student.cognitiveProfile,
    summary: {
      avgMastery,
      masteredTopics,
      totalTopics: allKnowledge.length,
      totalEnrollments: student.enrollments.length,
      totalAttempts,
      accuracy,
      retrievalDone,
      retrievalPending,
      retrievalUpcoming,
    },
    courses: student.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      enrolledAt: e.enrolledAt,
      topics: e.course.topics.map((t) => ({
        id: t.id,
        title: t.title,
        orderIndex: t.orderIndex,
        mastery: t.learnerKnowledge[0]?.masteryScore ?? null,
        accuracy: t.learnerKnowledge[0]?.recentAccuracy ?? null,
        attempts: t.learnerKnowledge[0]?.attempts ?? 0,
        lastStudiedAt: t.learnerKnowledge[0]?.lastStudiedAt ?? null,
      })),
    })),
  });
}
