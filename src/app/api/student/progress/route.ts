import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = session.user.profileId;

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      cognitiveProfile: true,
      enrollments: {
        include: {
          course: {
            include: {
              topics: {
                include: {
                  learnerKnowledge: {
                    where: { studentId },
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
      retrievalRecords: {
        select: { status: true, dueAt: true },
      },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalAttempts = await db.attempt.count({ where: { studentId } });
  const correctAttempts = await db.attempt.count({ where: { studentId, isCorrect: true } });
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
        lastPracticedAt: t.learnerKnowledge[0]?.lastPracticedAt ?? null,
      })),
    })),
  });
}
