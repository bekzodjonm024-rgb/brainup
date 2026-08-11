"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CPTTrial {
  letter: string;
  isTarget: boolean;
  responded: boolean;
  rtMs: number | null;
}

interface Props {
  item: { id: string; prompt: string; stimuluData: Record<string, unknown> };
  onComplete: (answer: unknown) => void;
  disabled: boolean;
}

type Phase = "intro" | "running" | "done";

export function AttentionCPTTask({ item, onComplete, disabled }: Props) {
  const data = item.stimuluData as {
    targetLetter: string;
    letters: string[];
    displayMs: number;
    itiMs: number;
  };

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentLetterIdx, setCurrentLetterIdx] = useState(-1);
  const [showLetter, setShowLetter] = useState(false);
  const [trials, setTrials] = useState<CPTTrial[]>([]);
  const [responded, setResponded] = useState(false);
  const trialStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const runNextTrial = useCallback((idx: number) => {
    if (idx >= data.letters.length) {
      setPhase("done");
      return;
    }
    setCurrentLetterIdx(idx);
    setResponded(false);
    setShowLetter(true);
    trialStartRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      setShowLetter(false);
      timerRef.current = setTimeout(() => runNextTrial(idx + 1), data.itiMs);
    }, data.displayMs);
  }, [data]);

  useEffect(() => () => clearTimer(), []);

  function handleResponse() {
    if (phase !== "running" || responded || disabled) return;
    const rt = Date.now() - trialStartRef.current;
    const letter = data.letters[currentLetterIdx];
    const isTarget = letter === data.targetLetter;

    setResponded(true);
    setTrials((prev) => {
      const existing = prev.findIndex((t, i) => i === currentLetterIdx);
      if (existing >= 0) return prev;
      return [...prev, { letter, isTarget, responded: true, rtMs: rt }];
    });
  }

  useEffect(() => {
    if (phase === "running" && !responded && showLetter === false) {
      const letter = data.letters[currentLetterIdx];
      const isTarget = letter === data.targetLetter;
      setTrials((prev) => {
        if (prev.length <= currentLetterIdx) {
          return [...prev, { letter, isTarget, responded: false, rtMs: null }];
        }
        return prev;
      });
    }
  }, [showLetter, phase, responded, currentLetterIdx, data.letters, data.targetLetter]);

  // Spacebar support for desktop users
  useEffect(() => {
    if (phase !== "running") return;
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") { e.preventDefault(); handleResponse(); }
    }
    window.addEventListener("keydown", onKey as unknown as EventListener);
    return () => window.removeEventListener("keydown", onKey as unknown as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, responded, disabled, currentLetterIdx, showLetter]);

  function handleSubmit() {
    onComplete({
      taskType: "ATTENTION_CPT",
      category: "ATTENTION",
      cptTrials: trials,
    });
  }

  const targets = data.letters.filter((l) => l === data.targetLetter).length;

  return (
    <Card>
      <CardContent className="p-8 text-center space-y-6">
        <p className="text-slate-700 text-sm">{item.prompt}</p>

        {phase === "intro" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-left space-y-1">
              <p className="text-sm font-medium text-blue-900">Qoida:</p>
              <p className="text-sm text-blue-700">
                Har bir harf alohida ko'rinadi. Faqat{" "}
                <span className="font-bold text-xl text-blue-900">{data.targetLetter}</span>{" "}
                ko'rganda ekranni bosing yoki <kbd className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs">Space</kbd> tugmasini bosing.
              </p>
            </div>
            <Button
              onClick={() => { setPhase("running"); runNextTrial(0); }}
              disabled={disabled}
              size="lg"
            >
              Boshlash
            </Button>
          </div>
        )}

        {phase === "running" && (
          <div
            className={cn(
              "mx-auto h-36 w-36 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-all",
              showLetter ? "bg-slate-900" : "bg-slate-100"
            )}
            onClick={handleResponse}
          >
            {showLetter && (
              <span className="text-6xl font-bold text-white">
                {data.letters[currentLetterIdx]}
              </span>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p>{data.letters.length} ta harf ko'rsatildi, {targets} ta maqsadli</p>
            </div>
            <Button onClick={handleSubmit} disabled={disabled}>
              Davom etish →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
