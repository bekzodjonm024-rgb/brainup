"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  item: { id: string; prompt: string; stimuluData: Record<string, unknown> };
  onComplete: (answer: unknown) => void;
  disabled: boolean;
}

type Phase = "intro" | "showing" | "blank" | "recall";

export function DigitSpanTask({ item, onComplete, disabled }: Props) {
  const data = item.stimuluData as { sequence: number[]; displayMs: number; gapMs: number };
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentDigitIdx, setCurrentDigitIdx] = useState(-1);
  const [input, setInput] = useState("");

  function startTask() {
    setPhase("showing");
    setCurrentDigitIdx(0);
  }

  useEffect(() => {
    if (phase !== "showing") return;
    const timeout = setTimeout(() => {
      if (currentDigitIdx < data.sequence.length - 1) {
        setPhase("blank");
        setTimeout(() => {
          setCurrentDigitIdx((i) => i + 1);
          setPhase("showing");
        }, data.gapMs);
      } else {
        setPhase("blank");
        setTimeout(() => setPhase("recall"), 500);
      }
    }, data.displayMs);
    return () => clearTimeout(timeout);
  }, [phase, currentDigitIdx, data]);

  function handleSubmit() {
    const given = input.split("").map(Number);
    onComplete({
      taskType: "DIGIT_SPAN",
      category: "WORKING_MEMORY",
      shownSequence: data.sequence,
      givenSequence: given,
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-8 text-center space-y-8">
      <p className="text-slate-500 dark:text-slate-400 text-sm">{item.prompt}</p>

      {phase === "intro" && (
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">{data.sequence.length} ta raqam ko&apos;rsatiladi</p>
          <Button
            onClick={startTask}
            disabled={disabled}
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 px-10"
          >
            Boshlash
          </Button>
        </div>
      )}

      {(phase === "showing" || phase === "blank") && (
        <div className="h-36 flex items-center justify-center">
          <span className={cn(
            "text-8xl font-bold transition-all duration-100",
            phase === "showing" ? "text-slate-900 dark:text-white scale-100" : "text-transparent scale-90"
          )}>
            {phase === "showing" ? data.sequence[currentDigitIdx] : "0"}
          </span>
        </div>
      )}

      {phase === "recall" && (
        <div className="space-y-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Raqamlarni tartibda kiriting:</p>
          <div className="flex justify-center gap-2">
            {Array.from({ length: data.sequence.length }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-12 w-10 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-colors",
                  input[i]
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#1e2840] text-slate-400 dark:text-slate-600"
                )}
              >
                {input[i] ?? "·"}
              </div>
            ))}
          </div>

          <div className="flex justify-center flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8,9,0].map((n) => (
              <button
                key={n}
                disabled={input.length >= data.sequence.length}
                onClick={() => setInput((s) => s.length < data.sequence.length ? s + n : s)}
                className="h-11 w-11 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#1e2840] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-30 transition-colors text-sm"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setInput((s) => s.slice(0, -1))}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#1e2840] text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              ←
            </button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={disabled || input.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 px-10"
          >
            Tasdiqlash →
          </Button>
        </div>
      )}
    </div>
  );
}
