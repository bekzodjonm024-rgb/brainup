export type TaskCategory =
  | "ATTENTION"
  | "WORKING_MEMORY"
  | "PROCESSING_SPEED"
  | "MEMORY";

export type TaskType =
  | "REACTION_TIME"      // Processing speed: click when circle appears
  | "DIGIT_SPAN"         // Working memory: remember digit sequence
  | "ATTENTION_CPT"      // Attention: click only on target letter (X)
  | "WORD_RECOGNITION";  // Memory: recognize words from earlier list

export interface RawResponse {
  taskType: TaskType;
  category: TaskCategory;
  // Reaction time
  reactionTimeMs?: number;
  targetShown?: boolean;
  responded?: boolean;
  // Digit span
  shownSequence?: number[];
  givenSequence?: number[];
  // CPT
  cptTrials?: { letter: string; isTarget: boolean; responded: boolean; rtMs: number | null }[];
  // Word recognition
  shownWords?: string[];
  recognizedWords?: string[];
  allOptions?: string[];
}

export interface CategoryScore {
  score: number;       // 0–100
  rawData: RawResponse[];
}

export interface AssessmentScores {
  attention: number;
  workingMemory: number;
  processingSpeed: number;
  memory: number;
  raw: {
    attention: RawResponse[];
    workingMemory: RawResponse[];
    processingSpeed: RawResponse[];
    memory: RawResponse[];
  };
}
