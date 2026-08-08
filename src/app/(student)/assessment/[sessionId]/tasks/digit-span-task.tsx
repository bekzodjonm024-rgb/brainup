"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
        setTimeout(() => {
          setPhase("recall");
          setTimeout(() => inputRef.current?.focus(), 100);
        }, 500);
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
    <Card>
      <CardContent className="p-8 text-center space-y-6">
        <p className="text-slate-700 text-sm">{item.prompt}</p>

        {phase === "intro" && (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm">{data.sequence.length} ta raqam ko'rsatiladi</p>
            <Button onClick={startTask} disabled={disabled} size="lg">Boshlash</Button>
          </div>
        )}

        {(phase === "showing" || phase === "blank") && (
          <div className="h-32 flex items-center justify-center">
            <span className={cn(
              "text-7xl font-bold transition-all duration-100",
              phase === "showing" ? "text-slate-900 scale-100" : "text-transparent scale-95"
            )}>
              {phase === "showing" ? data.sequence[currentDigitIdx] : "·"}
            </span>
          </div>
        )}

        {phase === "recall" && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Raqamlarni tartibda kiriting:</p>
            <div className="flex justify-center gap-1">
              {Array.from({ length: data.sequence.length }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-12 w-10 rounded-lg border-2 flex items-center justify-center text-xl font-bold",
                    input[i] ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-300"
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
                  className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-40"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setInput((s) => s.slice(0, -1))}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50"
              >
                ←
              </button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={disabled || input.length === 0}
            >
              Tasdiqlash →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
