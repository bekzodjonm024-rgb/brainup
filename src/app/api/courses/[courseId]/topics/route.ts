import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTopicSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  learningObjective: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0).optional(),
  prerequisiteTopicId: z.string().optional(),
});

async function assertCourseOwner(courseId: string, professorId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  return course?.professorId === professorId ? course : null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const owned = await assertCourseOwner(courseId, session.user.profileId);
  if (!owned) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const body = await req.json();
  const parsed = createTopicSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  // Auto-assign orderIndex if not provided
  if (parsed.data.orderIndex === undefined) {
    const count = await db.topic.count({ where: { courseId } });
    parsed.data.orderIndex = count;
  }

  const topic = await db.topic.create({
    data: { ...parsed.data, courseId },
  });

  return NextResponse.json(topic, { status: 201 });
}
