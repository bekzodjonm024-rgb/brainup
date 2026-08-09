import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/courses/[courseId]/students — enrolled students with mastery stats
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { professorId: true, topics: { select: { id: true } } },
  });
  if (!course) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          yearLevel: true,
          groupName: true,
          user: { select: { email: true } },
          learnerKnowledge: {
            where: { topicId: { in: course.topics.map((t) => t.id) } },
            select: { masteryScore: true, attempts: true, updatedAt: true },
          },
          _count: { select: { attempts: true } },
        },
      },
    },
    orderBy: { enrolledAt: "asc" },
  });

  const data = enrollments.map(({ student, enrolledAt }) => {
    const knowledge = student.learnerKnowledge;
    const avgMastery = knowledge.length
      ? knowledge.reduce((s, k) => s + k.masteryScore, 0) / knowledge.length
      : 0;
    const lastActive = knowledge.length
      ? knowledge.reduce((latest, k) =>
          k.updatedAt > latest ? k.updatedAt : latest,
          knowledge[0].updatedAt
        )
      : null;

    return {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      yearLevel: student.yearLevel,
      groupName: student.groupName,
      enrolledAt,
      avgMastery,
      totalAttempts: student._count.attempts,
      lastActive,
    };
  });

  return NextResponse.json(data);
}

// POST /api/courses/[courseId]/students — add student by email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { professorId: true },
  });
  if (!course) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email kerak" }, { status: 400 });

  const user = await db.user.findUnique({
    where: { email },
    include: { student: { select: { id: true } } },
  });

  if (!user?.student) {
    return NextResponse.json({ error: "Bu email bilan talaba topilmadi" }, { status: 404 });
  }

  const existing = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: user.student.id, courseId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Talaba allaqachon yozilgan" }, { status: 409 });
  }

  const enrollment = await db.enrollment.create({
    data: { studentId: user.student.id, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
