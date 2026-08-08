export interface MasteryInputs {
  recentAccuracy: number;
  historicalAccuracy: number;
  retrievalScore: number;
  consistencyScore: number;
}

export interface MasteryResult {
  score: number;
  level: "beginner" | "developing" | "proficient" | "mastered";
  label: string;
}

const WEIGHTS = {
  recentAccuracy: 0.40,
  historicalAccuracy: 0.25,
  retrievalScore: 0.20,
  consistency: 0.15,
};

export function calculateMastery(inputs: MasteryInputs): MasteryResult {
  const score =
    inputs.recentAccuracy * WEIGHTS.recentAccuracy +
    inputs.historicalAccuracy * WEIGHTS.historicalAccuracy +
    inputs.retrievalScore * WEIGHTS.retrievalScore +
    inputs.consistencyScore * WEIGHTS.consistency;

  const clamped = Math.min(Math.max(score, 0), 1);

  let level: MasteryResult["level"];
  let label: string;

  if (clamped < 0.5) {
    level = "beginner";
    label = "Boshlang'ich";
  } else if (clamped < 0.7) {
    level = "developing";
    label = "Rivojlanmoqda";
  } else if (clamped < 0.85) {
    level = "proficient";
    label = "Yaxshi";
  } else {
    level = "mastered";
    label = "O'zlashtirildi";
  }

  return { score: clamped, level, label };
}

export function updateRecentAccuracy(
  currentRecent: number,
  isCorrect: boolean,
  alpha = 0.3
): number {
  // Exponential moving average
  return alpha * (isCorrect ? 1 : 0) + (1 - alpha) * currentRecent;
}

export function updateHistoricalAccuracy(
  totalCorrect: number,
  totalAttempts: number
): number {
  if (totalAttempts === 0) return 0;
  return totalCorrect / totalAttempts;
}

export function calculateConsistency(scores: number[]): number {
  if (scores.length < 2) return scores[0] ?? 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, mean - stdDev);
}
