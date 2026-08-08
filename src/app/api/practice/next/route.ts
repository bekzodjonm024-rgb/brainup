import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { selectNextQuestion } from "@/lib/modules/learning/question-selector";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const sessionIds = searchParams.get("sessionIds")?.split(",") ?? [];

  if (!topicId) return NextResponse.json({ error: "topicId kerak" }, { status: 400 });

  const studentId = session.user.profileId;

  const [questions, recentAttempts, knowledge] = await Promise.all([
    db.question.findMany({
      where: { topicId, isActive: true },
      select: { id: true, difficulty: true, stem: true, type: true, options: true },
    }),
    db.attempt.findMany({
      where: { studentId, question: { topicId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { questionId: true, isCorrect: true, createdAt: true },
    }),
    db.learnerKnowledge.findUnique({
      where: { studentId_topicId: { studentId, topicId } },
      select: { masteryScore: true },
    }),
  ]);

  if (questions.length === 0) {
    return NextResponse.json({ question: null, message: "Savollar topilmadi" });
  }

  const sessionSet = new Set(sessionIds);
  const mastery = knowledge?.masteryScore ?? 0;

  const nextId = selectNextQuestion(
    questions.map((q) => ({ id: q.id, difficulty: q.difficulty })),
    recentAttempts,
    mastery,
    sessionSet
  );

  const question = questions.find((q) => q.id === nextId);
  return NextResponse.json({ question });
}
