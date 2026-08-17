import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await db.contentItem.findUnique({
    where: { id: contentId },
    select: { id: true, title: true, type: true, fileUrl: true, externalUrl: true, status: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  body: z.string().optional(),
  externalUrl: z.string().optional(),
  fileUrl: z.string().optional(),
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

  const { fileUrl, externalUrl, ...rest } = parsed.data;
  const isFileUrlOnlyUpdate = fileUrl !== undefined && Object.keys(rest).length === 0 && externalUrl === undefined;
  const updated = await db.contentItem.update({
    where: { id: contentId },
    data: {
      ...rest,
      ...(externalUrl !== undefined ? { externalUrl: externalUrl || null } : {}),
      ...(fileUrl !== undefined ? { fileUrl: fileUrl || null } : {}),
      ...(isFileUrlOnlyUpdate ? {} : { status: "DRAFT" }),
    },
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
