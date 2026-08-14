import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  learningObjective: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).optional(),
  prerequisiteTopicId: z.string().nullable().optional(),
});

async function assertTopicAccess(topicId: string, professorId: string) {
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: { course: { select: { professorId: true } } },
  });
  if (!topic || topic.course.professorId !== professorId) return null;
  return topic;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: {
      course: { select: { id: true, title: true, professorId: true } },
      contentItems: {
        orderBy: { orderIndex: "asc" },
        include: { sources: true },
      },
      prerequisiteTopic: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!topic) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json(topic);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const accessible = await assertTopicAccess(topicId, session.user.profileId);
  if (!accessible) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await db.topic.update({ where: { id: topicId }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  if (session.user.role === "PROFESSOR") {
    const accessible = await assertTopicAccess(topicId, session.user.profileId);
    if (!accessible) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  } else if (session.user.role === "ADMIN") {
    const exists = await db.topic.findUnique({ where: { id: topicId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  } else {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  // Cascade delete related data in FK order
  await db.retrievalRecord.deleteMany({ where: { topicId } });
  await db.learningEvent.deleteMany({ where: { topicId } });
  await db.recommendation.deleteMany({ where: { topicId } });
  await db.attempt.deleteMany({ where: { question: { topicId } } });
  await db.learnerKnowledge.deleteMany({ where: { topicId } });
  await db.question.deleteMany({ where: { topicId } });
  await db.contentItem.deleteMany({ where: { topicId } });
  await db.topic.delete({ where: { id: topicId } });

  return NextResponse.json({ success: true });
}
