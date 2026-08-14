"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { AttentionCPTTask } from "@/app/(student-focused)/assessment/[sessionId]/tasks/attention-cpt-task";
import { DigitSpanTask } from "@/app/(student-focused)/assessment/[sessionId]/tasks/digit-span-task";
import { ReactionTimeTask } from "@/app/(student-focused)/assessment/[sessionId]/tasks/reaction-time-task";
import { WordRecognitionTask } from "@/app/(student-focused)/assessment/[sessionId]/tasks/word-recognition-task";

type Category = "ATTENTION" | "WORKING_MEMORY" | "PROCESSING_SPEED" | "MEMORY";
type Difficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED";

interface Props {
  category: Category;
  difficulty: Difficulty;
  planId: string;
}

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
  ATTENTION:        { label: "Diqqat mashqi",        color: "text-indigo-400" },
  WORKING_MEMORY:   { label: "Ishchi xotira mashqi", color: "text-amber-400" },
  PROCESSING_SPEED: { label: "Tezlik mashqi",        color: "text-amber-400" },
  MEMORY:           { label: "Xotira mashqi",        color: "text-emerald-400" },
};

// Stimulus data generator — qiyinlik darajasiga qarab
function buildStimulus(category: Category, difficulty: Difficulty) {
  const id = `training-${category}-${Date.now()}`;

  if (category === "ATTENTION") {
    const count = difficulty === "BASIC" ? 20 : difficulty === "INTERMEDIATE" ? 35 : 50;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const targetLetter = "X";
    const generated = Array.from({ length: count }, () =>
      Math.random() < 0.25 ? targetLetter : letters[Math.floor(Math.random() * 25)]
    );
    return {
      id, prompt: `"${targetLetter}" harfini ko'rsangiz tezda bosing`,
      stimuluData: { targetLetter, letters: generated, displayMs: 800, itiMs: 400 },
    };
  }

  if (category === "WORKING_MEMORY") {
    const len = difficulty === "BASIC" ? 5 : difficulty === "INTERMEDIATE" ? 7 : 9;
    const sequence = Array.from({ length: len }, () => Math.floor(Math.random() * 9) + 1);
    return {
      id, prompt: "Raqamlar ketma-ketligini eslab qoling va kiriting",
      stimuluData: { sequence, displayMs: 800, gapMs: 300 },
    };
  }

  if (category === "PROCESSING_SPEED") {
    const timeoutMs = difficulty === "BASIC" ? 3000 : difficulty === "INTERMEDIATE" ? 2000 : 1200;
    return {
      id, prompt: "Yashil signal chiqishi bilanoq bosing",
      stimuluData: { delayRange: [1000, 3000], timeoutMs },
    };
  }

  // MEMORY — WordRecognition
  const wordPool = [
    "daraxt","kitob","qalam","eshik","oyna","stol","stul","lampа","non","suv",
    "gul","tosh","yulduz","qor","shamol","ot","arzon","bahor","kema","ko'l",
    "tog'","dalа","temir","tong","kechа","rang","xat","joy","yurak","qo'l",
  ];
  const studyCount = difficulty === "BASIC" ? 6 : difficulty === "INTERMEDIATE" ? 9 : 12;
  const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
  const studyWords = shuffled.slice(0, studyCount);
  const distractors = shuffled.slice(studyCount, studyCount + studyCount);
  const studyTimeMs = difficulty === "BASIC" ? 5000 : difficulty === "INTERMEDIATE" ? 4000 : 3000;

  return {
    id, prompt: "So'zlarni o'qib eslab qoling",
    stimuluData: { studyWords, distractors, studyTimeMs },
  };
}

// Trening natijasini 0–100 ga hisoblash
function calcScore(category: Category, answer: unknown, difficulty: Difficulty): number {
  const diffBonus = difficulty === "BASIC" ? 0 : difficulty === "INTERMEDIATE" ? 5 : 10;

  if (category === "PROCESSING_SPEED") {
    const a = answer as { reactionTimeMs?: number; responded?: boolean };
    if (!a?.responded || !a.reactionTimeMs) return 0;
    const base = Math.max(0, Math.min(100, ((700 - a.reactionTimeMs) / 500) * 100));
    return Math.round(Math.min(100, base + diffBonus));
  }

  if (category === "ATTENTION") {
    const a = answer as { cptTrials?: Array<{ isTarget: boolean; responded: boolean }> };
    if (!a?.cptTrials?.length) return 0;
    let hits = 0, misses = 0, fa = 0, cr = 0;
    for (const t of a.cptTrials) {
      if (t.isTarget && t.responded) hits++;
      else if (t.isTarget && !t.responded) misses++;
      else if (!t.isTarget && t.responded) fa++;
      else cr++;
    }
    const hitRate = hits / Math.max(1, hits + misses);
    const faRate = fa / Math.max(1, fa + cr);
    const base = ((hitRate - faRate + 1) / 2) * 100;
    return Math.round(Math.min(100, base + diffBonus));
  }

  if (category === "WORKING_MEMORY") {
    const a = answer as { shownSequence?: number[]; givenSequence?: number[] };
    const shown = a?.shownSequence ?? [];
    const given = a?.givenSequence ?? [];
    let correct = 0;
    for (let i = 0; i < shown.length; i++) {
      if (given[i] === shown[i]) correct++;
    }
    const base = shown.length > 0 ? (correct / shown.length) * 100 : 0;
    return Math.round(Math.min(100, base + diffBonus));
  }

  // MEMORY
  const a = answer as { shownWords?: string[]; recognizedWords?: string[] };
  const shown = new Set(a?.shownWords ?? []);
  const recognized = new Set(a?.recognizedWords ?? []);
  let hits = 0, fa = 0;
  for (const w of recognized) {
    if (shown.has(w)) hits++; else fa++;
  }
  const base = shown.size > 0 ? Math.max(0, ((hits - fa) / shown.size) * 100) : 0;
  return Math.round(Math.min(100, base + diffBonus));
}

type Phase = "ready" | "running" | "done";

export function TrainingRunner({ category, difficulty, planId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const meta = CATEGORY_META[category];
  const item = useMemo(() => buildStimulus(category, difficulty), [category, difficulty]);

  async function handleComplete(answer: unknown) {
    const s = calcScore(category, answer, difficulty);
    setScore(s);
    setPhase("done");
    setSubmitting(true);

    await fetch("/api/training/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, category, difficulty, score: s }),
    });

    setSubmitting(false);
  }

  const DIFF_LABEL: Record<string, string> = {
    BASIC: "Boshlang'ich", INTERMEDIATE: "O'rta", ADVANCED: "Murakkab",
  };

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <BrainUPLogo size="sm" href="/training" />
        <div className="text-right">
          <p className={`font-semibold ${meta.color}`}>{meta.label}</p>
          <p className="text-xs text-stone-400">{DIFF_LABEL[difficulty]}</p>
        </div>
      </div>

      {phase === "ready" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <p className="text-slate-300 text-sm mb-2">Mashq tayyor</p>
          <h1 className={`text-2xl font-bold mb-6 ${meta.color}`}>{meta.label}</h1>
          <p className="text-stone-400 text-sm mb-8">{item.prompt}</p>
          <button
            onClick={() => setPhase("running")}
            className="w-full py-3 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-semibold transition-colors"
          >
            Boshlash
          </button>
        </div>
      )}

      {phase === "running" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          {category === "ATTENTION" && (
            <AttentionCPTTask key={item.id} item={item} onComplete={handleComplete} disabled={false} />
          )}
          {category === "WORKING_MEMORY" && (
            <DigitSpanTask key={item.id} item={item} onComplete={handleComplete} disabled={false} />
          )}
          {category === "PROCESSING_SPEED" && (
            <ReactionTimeTask key={item.id} item={item} onComplete={handleComplete} disabled={false} />
          )}
          {category === "MEMORY" && (
            <WordRecognitionTask key={item.id} item={item} onComplete={handleComplete} disabled={false} />
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <div className="text-6xl mb-4">
            {score! >= 75 ? "🎉" : score! >= 50 ? "💪" : "📈"}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Mashq tugadi!</h2>
          <p className="text-stone-400 text-sm mb-6">Sizning natijangiz</p>
          <div className={`text-5xl font-bold mb-8 ${meta.color}`}>{score}%</div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/training")}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? "Saqlanmoqda..." : "Tugash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
