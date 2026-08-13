import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleAI, isAIAvailable } from "@/lib/ai/client";
import { z } from "zod";

const schema = z.object({
  topicId: z.string(),
  count: z.number().int().min(1).max(10).default(5),
});

interface GeneratedQuestion {
  stem: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "BASIC" | "INTERMEDIATE" | "ADVANCED";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  if (!isAIAvailable()) {
    return NextResponse.json(
      { error: "AI xizmati sozlanmagan. GOOGLE_API_KEY ni Vercel'ga qo'shing." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { topicId, count } = parsed.data;

  // Verify professor owns this topic's course
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: {
      course: { select: { professorId: true, title: true } },
      contentItems: {
        where: { status: "APPROVED" },
        select: { title: true, body: true },
        take: 5,
      },
    },
  });

  if (!topic) return NextResponse.json({ error: "Mavzu topilmadi" }, { status: 404 });
  if (topic.course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const contentText = topic.contentItems
    .map((c) => `### ${c.title}\n${c.body ?? ""}`)
    .join("\n\n")
    .trim();

  if (!contentText) {
    return NextResponse.json(
      { error: "Savol yaratish uchun tasdiqlangan material kerak. Avval material qo'shing va tasdiqlang." },
      { status: 400 }
    );
  }

  const prompt = `Siz pedagogika fanidan mutaxassis o'qituvchisiz. Quyidagi mavzu bo'yicha ${count} ta test savoli yarating.

Mavzu: "${topic.title}"
${topic.learningObjective ? `O'quv maqsadi: ${topic.learningObjective}` : ""}
Kurs: ${topic.course.title}

Mazmun:
${contentText}

Talablar:
- Har bir savolda aynan 4 ta javob varianti bo'lsin (options massivida)
- Faqat bitta to'g'ri javob bo'lsin — u options massividagi variantlardan birining aynan o'zi bo'lsin
- Har bir savol uchun qisqa tushuntirish (explanation) yozing — nima uchun to'g'ri javob shu ekanligini
- Qiyinlik darajalarini aralashtiring: BASIC (asosiy), INTERMEDIATE (o'rta), ADVANCED (murakkab)
- Savollar faqat berilgan matnga asoslansin
- O'zbek tilida yozing

Faqat JSON massivini qaytaring, boshqa matn yo'q:
[
  {
    "stem": "savol matni",
    "options": ["A variant", "B variant", "C variant", "D variant"],
    "answer": "to'g'ri variant (options dan birining aynan o'zi)",
    "explanation": "nima uchun bu to'g'ri javob",
    "difficulty": "BASIC"
  }
]`;

  try {
    const model = googleAI!.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Extract JSON array from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI javobni tahlil qilishda xato" }, { status: 500 });
    }

    const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

    // Validate structure
    const valid = questions.filter(
      (q) =>
        q.stem && Array.isArray(q.options) && q.options.length === 4 &&
        q.answer && q.options.includes(q.answer) && q.explanation &&
        ["BASIC", "INTERMEDIATE", "ADVANCED"].includes(q.difficulty)
    );

    if (valid.length === 0) {
      return NextResponse.json({ error: "AI yaroqli savollar yarata olmadi" }, { status: 500 });
    }

    return NextResponse.json({ questions: valid });
  } catch (err) {
    console.error("AI generate-questions error:", err);
    return NextResponse.json({ error: "AI xizmatida xato yuz berdi" }, { status: 500 });
  }
}
