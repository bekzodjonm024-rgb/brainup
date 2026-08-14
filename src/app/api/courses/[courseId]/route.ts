import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(500).optional(),
  semester: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

async function assertOwner(courseId: string, professorId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.professorId !== professorId) return null;
  return course;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      professor: { select: { firstName: true, lastName: true, title: true } },
      faculty: { select: { name: true } },
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { questions: true, contentItems: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const owned = await assertOwner(courseId, session.user.profileId);
  if (!owned) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await db.course.update({ where: { id: courseId }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  if (session.user.role === "PROFESSOR") {
    const owned = await assertOwner(courseId, session.user.profileId);
    if (!owned) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  } else if (session.user.role === "ADMIN") {
    const exists = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  } else {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  // Cascade delete in FK order
  const topicIds = (await db.topic.findMany({ where: { courseId }, select: { id: true } })).map((t) => t.id);
  if (topicIds.length > 0) {
    await db.retrievalRecord.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.learningEvent.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.recommendation.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.attempt.deleteMany({ where: { question: { topicId: { in: topicIds } } } });
    await db.learnerKnowledge.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.question.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.contentItem.deleteMany({ where: { topicId: { in: topicIds } } });
    await db.topic.deleteMany({ where: { courseId } });
  }
  await db.learningEvent.deleteMany({ where: { courseId } });
  await db.enrollment.deleteMany({ where: { courseId } });
  await db.course.delete({ where: { id: courseId } });

  return NextResponse.json({ success: true });
}
