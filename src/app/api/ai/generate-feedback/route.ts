import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleAI, isAIAvailable } from "@/lib/ai/client";
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
    const model = googleAI!.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const feedback = result.response.text().trim();

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: null });
  }
}
