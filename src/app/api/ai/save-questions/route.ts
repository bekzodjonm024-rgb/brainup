import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const questionSchema = z.object({
  stem: z.string().min(5),
  options: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string().optional(),
  difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
});

const schema = z.object({
  topicId: z.string(),
  questions: z.array(questionSchema).min(1).max(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { topicId, questions } = parsed.data;

  // Verify professor owns this topic's course
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: { course: { select: { professorId: true } } },
  });

  if (!topic) return NextResponse.json({ error: "Mavzu topilmadi" }, { status: 404 });
  if (topic.course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const created = await db.$transaction(
    questions.map((q) =>
      db.question.create({
        data: {
          topicId,
          type: "MULTIPLE_CHOICE",
          difficulty: q.difficulty,
          stem: q.stem,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation ?? null,
          isActive: true,
        },
      })
    )
  );

  return NextResponse.json({ saved: created.length });
}
