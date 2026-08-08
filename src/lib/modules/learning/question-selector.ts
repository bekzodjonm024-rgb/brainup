import { DifficultyLevel } from "@/generated/prisma";

export interface QuestionMeta {
  id: string;
  difficulty: DifficultyLevel;
}

export interface AttemptHistory {
  questionId: string;
  isCorrect: boolean;
  createdAt: Date;
}

/**
 * Selects the next best question for a student on a topic.
 *
 * Strategy:
 * 1. Skip questions answered correctly in recent N attempts (avoid repetition)
 * 2. Prefer questions the student got wrong before
 * 3. Match difficulty to mastery level
 */
export function selectNextQuestion(
  questions: QuestionMeta[],
  recentAttempts: AttemptHistory[],
  masteryScore: number,
  sessionQuestionIds: Set<string>
): string | null {
  if (questions.length === 0) return null;

  const targetDifficulty = getDifficultyForMastery(masteryScore);

  // Questions not yet in this session
  const available = questions.filter((q) => !sessionQuestionIds.has(q.id));
  if (available.length === 0) {
    // Allow repeats if exhausted
    return questions[Math.floor(Math.random() * questions.length)].id;
  }

  // Questions student recently got wrong → prioritize
  const recentWrongIds = new Set(
    recentAttempts
      .filter((a) => !a.isCorrect)
      .slice(0, 10)
      .map((a) => a.questionId)
  );

  // First: wrong + matching difficulty
  const wrongMatchDiff = available.filter(
    (q) => recentWrongIds.has(q.id) && q.difficulty === targetDifficulty
  );
  if (wrongMatchDiff.length > 0) return pick(wrongMatchDiff).id;

  // Second: wrong (any difficulty)
  const wrongAny = available.filter((q) => recentWrongIds.has(q.id));
  if (wrongAny.length > 0) return pick(wrongAny).id;

  // Third: matching difficulty (not wrong)
  const matchDiff = available.filter((q) => q.difficulty === targetDifficulty);
  if (matchDiff.length > 0) return pick(matchDiff).id;

  // Fallback: any available
  return pick(available).id;
}

function getDifficultyForMastery(mastery: number): DifficultyLevel {
  if (mastery < 0.5) return DifficultyLevel.BASIC;
  if (mastery < 0.75) return DifficultyLevel.INTERMEDIATE;
  return DifficultyLevel.ADVANCED;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
