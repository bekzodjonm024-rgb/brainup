export type TrainingCategory = "ATTENTION" | "WORKING_MEMORY" | "PROCESSING_SPEED" | "MEMORY";
export type TrainingDifficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface TrainingExercise {
  category: TrainingCategory;
  difficulty: TrainingDifficulty;
  order: number;
  completed: boolean;
}

export interface CognitiveScores {
  attentionScore: number;
  workingMemoryScore: number;
  processingSpeedScore: number;
  memoryScore: number;
}

// 9-kunlik tsikl jadvali (kun 10 = diagnostik test)
const CYCLE_PLAN: Array<Array<{ category: TrainingCategory; difficulty: TrainingDifficulty }>> = [
  // Kun 1
  [{ category: "ATTENTION", difficulty: "BASIC" }, { category: "WORKING_MEMORY", difficulty: "BASIC" }],
  // Kun 2
  [{ category: "PROCESSING_SPEED", difficulty: "BASIC" }, { category: "MEMORY", difficulty: "BASIC" }],
  // Kun 3
  [{ category: "ATTENTION", difficulty: "INTERMEDIATE" }, { category: "MEMORY", difficulty: "INTERMEDIATE" }],
  // Kun 4
  [{ category: "WORKING_MEMORY", difficulty: "INTERMEDIATE" }, { category: "PROCESSING_SPEED", difficulty: "INTERMEDIATE" }],
  // Kun 5
  [{ category: "ATTENTION", difficulty: "ADVANCED" }, { category: "WORKING_MEMORY", difficulty: "BASIC" }],
  // Kun 6
  [{ category: "MEMORY", difficulty: "ADVANCED" }, { category: "PROCESSING_SPEED", difficulty: "BASIC" }],
  // Kun 7
  [{ category: "ATTENTION", difficulty: "INTERMEDIATE" }, { category: "PROCESSING_SPEED", difficulty: "ADVANCED" }],
  // Kun 8
  [{ category: "WORKING_MEMORY", difficulty: "ADVANCED" }, { category: "MEMORY", difficulty: "INTERMEDIATE" }],
  // Kun 9 — tayyorlov kuni (4 ta qisqa mashq)
  [
    { category: "ATTENTION", difficulty: "BASIC" },
    { category: "WORKING_MEMORY", difficulty: "BASIC" },
    { category: "PROCESSING_SPEED", difficulty: "BASIC" },
    { category: "MEMORY", difficulty: "BASIC" },
  ],
];

function scoreForCategory(scores: CognitiveScores, cat: TrainingCategory): number {
  if (cat === "ATTENTION") return scores.attentionScore;
  if (cat === "WORKING_MEMORY") return scores.workingMemoryScore;
  if (cat === "PROCESSING_SPEED") return scores.processingSpeedScore;
  return scores.memoryScore;
}

function adjustDifficulty(
  base: TrainingDifficulty,
  score: number
): TrainingDifficulty {
  // Zaif soha (< 50) → 1 daraja past
  if (score < 50) {
    if (base === "ADVANCED") return "INTERMEDIATE";
    if (base === "INTERMEDIATE") return "BASIC";
    return "BASIC";
  }
  return base;
}

export function generateDayPlan(
  cycleDay: number, // 1–9
  scores: CognitiveScores
): TrainingExercise[] {
  const dayIndex = Math.min(Math.max(cycleDay - 1, 0), 8);
  const template = CYCLE_PLAN[dayIndex];

  return template.map((ex, i) => ({
    category: ex.category,
    difficulty: adjustDifficulty(ex.difficulty, scoreForCategory(scores, ex.category)),
    order: i + 1,
    completed: false,
  }));
}

// Tsikldagi kun raqamini hisoblash (1–9, keyin diagnostik)
export function calcCycleDay(lastDiagnosticAt: Date | null): number {
  if (!lastDiagnosticAt) return 1;
  const daysPassed = Math.floor(
    (Date.now() - lastDiagnosticAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  // 1–9: mashq kunlari, 10+: diagnostik
  const day = (daysPassed % 10) + 1;
  return Math.min(day, 9);
}

export function isDiagnosticDue(nextDiagnosticAt: Date | null): boolean {
  if (!nextDiagnosticAt) return false;
  return new Date() >= nextDiagnosticAt;
}
