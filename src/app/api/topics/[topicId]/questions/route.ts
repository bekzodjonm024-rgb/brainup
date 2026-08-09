import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]).default("BASIC"),
  stem: z.string().min(5),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.boolean()]),
  explanation: z.string().optional(),
});

async function verifyProfessorOwns(topicId: string, professorId: string) {
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: { course: { select: { professorId: true } } },
  });
  return topic && topic.course.professorId === professorId ? topic : null;
}

// GET /api/topics/[topicId]/questions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const topic = await verifyProfessorOwns(topicId, session.user.profileId);
  if (!topic) return NextResponse.json({ error: "Topilmadi yoki ruxsat yo'q" }, { status: 404 });

  const questions = await db.question.findMany({
    where: { topicId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(questions);
}

// POST /api/topics/[topicId]/questions
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const topic = await verifyProfessorOwns(topicId, session.user.profileId);
  if (!topic) return NextResponse.json({ error: "Topilmadi yoki ruxsat yo'q" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, difficulty, stem, options, answer, explanation } = parsed.data;

  const question = await db.question.create({
    data: {
      topicId,
      type,
      difficulty,
      stem,
      options: options ?? undefined,
      answer,
      explanation: explanation ?? null,
      isActive: true,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
