import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]).optional(),
  stem: z.string().min(5).optional(),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.boolean()]).optional(),
  explanation: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function verifyProfessorOwns(questionId: string, professorId: string) {
  const q = await db.question.findUnique({
    where: { id: questionId },
    include: { topic: { include: { course: { select: { professorId: true } } } } },
  });
  return q && q.topic.course.professorId === professorId ? q : null;
}

// PUT /api/questions/[questionId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const q = await verifyProfessorOwns(questionId, session.user.profileId);
  if (!q) return NextResponse.json({ error: "Topilmadi yoki ruxsat yo'q" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await db.question.update({
    where: { id: questionId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

// DELETE /api/questions/[questionId] — soft delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const q = await verifyProfessorOwns(questionId, session.user.profileId);
  if (!q) return NextResponse.json({ error: "Topilmadi yoki ruxsat yo'q" }, { status: 404 });

  await db.question.update({
    where: { id: questionId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
