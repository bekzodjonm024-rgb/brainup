import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const professorId = session.user.profileId;

  const course = await db.course.findFirst({
    where: { id: courseId, professorId },
    select: { id: true, title: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const enrollment = await db.enrollment.findFirst({
    where: { studentId, courseId },
    select: { enrolledAt: true },
  });
  if (!enrollment) return NextResponse.json({ error: "Student not enrolled" }, { status: 404 });

  const student = await db.student.findUnique({
    where: { id: studentId },
    select: {
      firstName: true,
      lastName: true,
      groupName: true,
      yearLevel: true,
      cognitiveProfile: true,
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const topics = await db.topic.findMany({
    where: { courseId },
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
  });

  const attempts = await db.practiceAttempt.findMany({
    where: {
      studentId,
      question: { topic: { courseId } },
    },
    select: { isCorrect: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;

  return NextResponse.json({
    student: {
      ...student,
      enrolledAt: enrollment.enrolledAt,
    },
    course,
    topics: topics.map((t) => ({
      id: t.id,
      title: t.title,
      orderIndex: t.orderIndex,
      mastery: t.learnerKnowledge[0]?.masteryScore ?? null,
      accuracy: t.learnerKnowledge[0]?.recentAccuracy ?? null,
      attempts: t.learnerKnowledge[0]?.attempts ?? 0,
      lastStudiedAt: t.learnerKnowledge[0]?.lastStudiedAt ?? null,
    })),
    stats: {
      totalAttempts,
      accuracy: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
      topicsStarted: topics.filter((t) => t.learnerKnowledge.length > 0).length,
      topicsMastered: topics.filter(
        (t) => (t.learnerKnowledge[0]?.masteryScore ?? 0) >= 0.85
      ).length,
      totalTopics: topics.length,
    },
  });
}
