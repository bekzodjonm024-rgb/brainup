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
    include: {
      cognitiveProfile: true,
      user: { select: { email: true } },
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const topics = await db.topic.findMany({
    where: { courseId },
    include: {
      learnerKnowledge: {
        where: { studentId },
        take: 1,
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const totalAttempts = await db.attempt.count({
    where: {
      studentId,
      question: { topic: { courseId } },
    },
  });
  const correctAttempts = await db.attempt.count({
    where: {
      studentId,
      isCorrect: true,
      question: { topic: { courseId } },
    },
  });

  return NextResponse.json({
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      groupName: student.groupName,
      yearLevel: student.yearLevel,
      email: student.user.email,
      enrolledAt: enrollment.enrolledAt,
      cognitiveProfile: student.cognitiveProfile,
    },
    course,
    topics: topics.map((t) => ({
      id: t.id,
      title: t.title,
      orderIndex: t.orderIndex,
      mastery: t.learnerKnowledge[0]?.masteryScore ?? null,
      accuracy: t.learnerKnowledge[0]?.recentAccuracy ?? null,
      attempts: t.learnerKnowledge[0]?.attempts ?? 0,
      lastPracticedAt: t.learnerKnowledge[0]?.lastPracticedAt ?? null,
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
