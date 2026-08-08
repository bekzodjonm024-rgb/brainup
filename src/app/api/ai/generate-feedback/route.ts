import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { anthropic, isAIAvailable } from "@/lib/ai/client";
import { z } from "zod";

const schema = z.object({
  questionId: z.string(),
  studentAnswer: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  if (!isAIAvailable()) {
    return NextResponse.json({ feedback: null }, { status: 200 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ feedback: null });

  const { questionId, studentAnswer } = parsed.data;

  const question = await db.question.findUnique({
    where: { id: questionId },
    include: { topic: { select: { title: true } } },
  });

  if (!question) return NextResponse.json({ feedback: null });

  const correctAnswer = String(question.answer);

  const prompt = `Talaba test savolini noto'g'ri javobladi. Qisqa, do'stona va yordam beruvchi tushuntirish yozing.

Mavzu: ${question.topic.title}
Savol: ${question.stem}
To'g'ri javob: ${correctAnswer}
Talaba javobi: ${studentAnswer}
${question.explanation ? `Asosiy tushuntirish: ${question.explanation}` : ""}

2-3 gap hajmida, o'zbek tilida, nima uchun to'g'ri javob shu ekanini va talabaning xatosi nima sababdan bo'lganini tushuntiring. Faqat tushuntirishning o'zini yozing.`;

  try {
    const message = await anthropic!.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: null });
  }
}
