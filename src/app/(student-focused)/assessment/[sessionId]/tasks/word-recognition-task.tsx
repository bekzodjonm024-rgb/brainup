"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  item: { id: string; prompt: string; stimuluData: Record<string, unknown> };
  onComplete: (answer: unknown) => void;
  disabled: boolean;
}

type Phase = "study" | "delay" | "recognition";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function WordRecognitionTask({ item, onComplete, disabled }: Props) {
  const data = item.stimuluData as {
    studyWords: string[];
    distractors: string[];
    studyTimeMs: number;
  };

  const [phase, setPhase] = useState<Phase>("study");
  const [timeLeft, setTimeLeft] = useState(Math.round(data.studyTimeMs / 1000));
  const [allOptions] = useState(() => shuffle([...data.studyWords, ...data.distractors]));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (phase !== "study") return;
    if (timeLeft <= 0) {
      setPhase("delay");
      setTimeout(() => setPhase("recognition"), 1500);
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  function toggleWord(word: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  }

  function handleSubmit() {
    onComplete({
      taskType: "WORD_RECOGNITION",
      category: "MEMORY",
      shownWords: data.studyWords,
      recognizedWords: Array.from(selected),
      allOptions,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center">{item.prompt}</p>

      {phase === "study" && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">So&apos;zlarni yodlang</span>
            <span className="font-mono font-bold text-blue-400">{timeLeft}s</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.studyWords.map((word) => (
              <div key={word} className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2.5 text-center text-sm font-medium text-blue-300">
                {word}
              </div>
            ))}
          </div>
        </>
      )}

      {phase === "delay" && (
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4">
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Tayyor bo&apos;ling...</p>
        </div>
      )}

      {phase === "recognition" && (
        <>
          <p className="text-sm text-slate-500 text-center">
            Oldin ko&apos;rgan so&apos;zlaringizni tanlang ({selected.size} ta tanlandi):
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
            {allOptions.map((word) => (
              <button
                key={word}
                onClick={() => toggleWord(word)}
                disabled={disabled}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left flex items-center gap-2",
                  selected.has(word)
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {selected.has(word) && <Check className="h-3.5 w-3.5 shrink-0 text-blue-400" />}
                {word}
              </button>
            ))}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0"
          >
            Tasdiqlash ({selected.size}/{data.studyWords.length}) →
          </Button>
        </>
      )}
    </div>
  );
}
