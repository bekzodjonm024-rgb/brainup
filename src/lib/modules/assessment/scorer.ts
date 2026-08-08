import type { AssessmentScores, CategoryScore, RawResponse } from "./types";

// ─── PROCESSING SPEED (Reaction Time) ───────────────────────
// Based on normative data: 200ms = excellent, 600ms = poor
function scoreReactionTime(responses: RawResponse[]): number {
  const valid = responses.filter(
    (r) => r.taskType === "REACTION_TIME" && r.targetShown && r.responded && r.reactionTimeMs
  );
  if (valid.length === 0) return 0;

  const meanRt = valid.reduce((s, r) => s + (r.reactionTimeMs ?? 0), 0) / valid.length;
  // Linear scale: 200ms → 100, 700ms → 0
  const score = Math.max(0, Math.min(100, ((700 - meanRt) / 500) * 100));
  return Math.round(score);
}

// ─── WORKING MEMORY (Digit Span) ────────────────────────────
// Score = % correct digits in correct position
function scoreDigitSpan(responses: RawResponse[]): number {
  const items = responses.filter((r) => r.taskType === "DIGIT_SPAN");
  if (items.length === 0) return 0;

  let totalCorrect = 0;
  let totalDigits = 0;

  for (const item of items) {
    const shown = item.shownSequence ?? [];
    const given = item.givenSequence ?? [];
    totalDigits += shown.length;
    for (let i = 0; i < shown.length; i++) {
      if (given[i] === shown[i]) totalCorrect++;
    }
  }

  return totalDigits > 0 ? Math.round((totalCorrect / totalDigits) * 100) : 0;
}

// ─── ATTENTION (CPT) ────────────────────────────────────────
// Score = d' inspired simplified: (hit_rate - false_alarm_rate) normalized
function scoreAttentionCPT(responses: RawResponse[]): number {
  const items = responses.filter((r) => r.taskType === "ATTENTION_CPT");
  if (items.length === 0) return 0;

  let hits = 0, misses = 0, falseAlarms = 0, correctRejects = 0;

  for (const item of items) {
    for (const trial of item.cptTrials ?? []) {
      if (trial.isTarget && trial.responded) hits++;
      else if (trial.isTarget && !trial.responded) misses++;
      else if (!trial.isTarget && trial.responded) falseAlarms++;
      else correctRejects++;
    }
  }

  const total = hits + misses + falseAlarms + correctRejects;
  if (total === 0) return 0;

  const hitRate = hits / Math.max(1, hits + misses);
  const faRate = falseAlarms / Math.max(1, falseAlarms + correctRejects);

  // Sensitivity: higher hit rate, lower FA rate → better score
  const sensitivity = (hitRate - faRate + 1) / 2; // normalize 0–1
  return Math.round(sensitivity * 100);
}

// ─── MEMORY (Word Recognition) ──────────────────────────────
// Score = (hits - false alarms) / total_targets * 100
function scoreWordRecognition(responses: RawResponse[]): number {
  const items = responses.filter((r) => r.taskType === "WORD_RECOGNITION");
  if (items.length === 0) return 0;

  let hits = 0, falseAlarms = 0, totalTargets = 0;

  for (const item of items) {
    const shown = new Set(item.shownWords ?? []);
    const recognized = new Set(item.recognizedWords ?? []);
    totalTargets += shown.size;

    for (const word of recognized) {
      if (shown.has(word)) hits++;
      else falseAlarms++;
    }
  }

  if (totalTargets === 0) return 0;
  const score = ((hits - falseAlarms) / totalTargets) * 100;
  return Math.max(0, Math.round(score));
}

// ─── MAIN SCORER ────────────────────────────────────────────
export function scoreAssessment(allResponses: RawResponse[]): AssessmentScores {
  const byCategory = {
    ATTENTION: allResponses.filter((r) => r.category === "ATTENTION"),
    WORKING_MEMORY: allResponses.filter((r) => r.category === "WORKING_MEMORY"),
    PROCESSING_SPEED: allResponses.filter((r) => r.category === "PROCESSING_SPEED"),
    MEMORY: allResponses.filter((r) => r.category === "MEMORY"),
  };

  return {
    attention: scoreAttentionCPT(byCategory.ATTENTION),
    workingMemory: scoreDigitSpan(byCategory.WORKING_MEMORY),
    processingSpeed: scoreReactionTime(byCategory.PROCESSING_SPEED),
    memory: scoreWordRecognition(byCategory.MEMORY),
    raw: {
      attention: byCategory.ATTENTION,
      workingMemory: byCategory.WORKING_MEMORY,
      processingSpeed: byCategory.PROCESSING_SPEED,
      memory: byCategory.MEMORY,
    },
  };
}
