import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ContentType } from "@/generated/prisma";

const createContentSchema = z.object({
  topicId: z.string(),
  type: z.nativeEnum(ContentType),
  title: z.string().min(2).max(200),
  body: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
  orderIndex: z.number().int().min(0).optional(),
  sources: z.array(z.object({
    title: z.string(),
    authors: z.string().optional(),
    journal: z.string().optional(),
    year: z.number().int().optional(),
    url: z.string().optional(),
    doi: z.string().optional(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createContentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  // Verify topic belongs to professor's course
  const topic = await db.topic.findUnique({
    where: { id: parsed.data.topicId },
    include: { course: { select: { professorId: true } } },
  });

  if (!topic || topic.course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const { sources, externalUrl, ...contentData } = parsed.data;

  const content = await db.contentItem.create({
    data: {
      ...contentData,
      externalUrl: externalUrl || null,
      status: "DRAFT",
      sources: sources?.length ? { create: sources } : undefined,
    },
    include: { sources: true },
  });

  return NextResponse.json(content, { status: 201 });
}
