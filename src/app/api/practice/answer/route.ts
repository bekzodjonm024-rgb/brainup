import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateLearnerKnowledge } from "@/lib/modules/mastery/updater";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string(),
  topicId: z.string(),
  givenAnswer: z.unknown(),
  responseTimeMs: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json();
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { questionId, topicId, givenAnswer, responseTimeMs } = parsed.data;
  const studentId = session.user.profileId;

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });

  // Check correctness
  const correctAnswer = question.answer as unknown;
  const isCorrect = checkAnswer(givenAnswer, correctAnswer, question.type);

  // Save attempt
  await db.attempt.create({
    data: {
      studentId,
      questionId,
      givenAnswer: givenAnswer as Parameters<typeof db.attempt.create>[0]["data"]["givenAnswer"],
      isCorrect,
      responseTimeMs: responseTimeMs ?? null,
    },
  });

  // Log event
  await db.learningEvent.create({
    data: {
      studentId,
      topicId,
      eventType: "QUESTION_ANSWERED",
      payload: { questionId, isCorrect, responseTimeMs },
    },
  });

  // Update mastery
  const masteryResult = await updateLearnerKnowledge(studentId, topicId, isCorrect);

  return NextResponse.json({
    isCorrect,
    correctAnswer,
    explanation: question.explanation,
    mastery: masteryResult,
  });
}

function checkAnswer(given: unknown, correct: unknown, type: string): boolean {
  if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
    return String(given) === String(correct);
  }
  if (type === "SHORT_ANSWER") {
    return (
      String(given).trim().toLowerCase() === String(correct).trim().toLowerCase()
    );
  }
  return String(given) === String(correct);
}
