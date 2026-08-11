"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="p-6 space-y-5">
        <p className="text-slate-700 text-sm text-center">{item.prompt}</p>

        {phase === "study" && (
          <>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>So'zlarni yodlang</span>
              <span className="font-mono font-medium text-blue-600">{timeLeft}s</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.studyWords.map((word) => (
                <div key={word} className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-900">
                  {word}
                </div>
              ))}
            </div>
          </>
        )}

        {phase === "delay" && (
          <div className="py-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Tayyor bo'ling...</p>
          </div>
        )}

        {phase === "recognition" && (
          <>
            <p className="text-sm text-slate-600 text-center">
              Oldin ko'rgan so'zlaringizni tanlang ({selected.size} ta tanlandi):
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto rounded-lg border border-slate-100 p-1">
              {allOptions.map((word) => (
                <button
                  key={word}
                  onClick={() => toggleWord(word)}
                  disabled={disabled}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left flex items-center gap-1.5",
                    selected.has(word)
                      ? "border-blue-400 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {selected.has(word) && <Check className="h-3.5 w-3.5 shrink-0" />}
                  {word}
                </button>
              ))}
            </div>
            <Button onClick={handleSubmit} disabled={disabled} className="w-full mt-2">
              Tasdiqlash ({selected.size}/{data.studyWords.length}) →
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
