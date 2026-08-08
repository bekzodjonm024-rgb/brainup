import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  body: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  orderIndex: z.number().int().min(0).optional(),
});

async function assertContentAccess(contentId: string, professorId: string) {
  const content = await db.contentItem.findUnique({
    where: { id: contentId },
    include: { topic: { include: { course: { select: { professorId: true } } } } },
  });
  if (!content || content.topic.course.professorId !== professorId) return null;
  return content;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const accessible = await assertContentAccess(contentId, session.user.profileId);
  if (!accessible) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await db.contentItem.update({
    where: { id: contentId },
    data: { ...parsed.data, status: "DRAFT" },
    include: { sources: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const accessible = await assertContentAccess(contentId, session.user.profileId);
  if (!accessible) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await db.contentItem.delete({ where: { id: contentId } });
  return NextResponse.json({ success: true });
}
