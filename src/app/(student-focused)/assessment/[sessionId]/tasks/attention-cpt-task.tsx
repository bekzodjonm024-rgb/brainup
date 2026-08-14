"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
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
    if (idx >= data.letters.length) { setPhase("done"); return; }
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
      if (prev.findIndex((_, i) => i === currentLetterIdx) >= 0) return prev;
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
    onComplete({ taskType: "ATTENTION_CPT", category: "ATTENTION", cptTrials: trials });
  }

  const targets = data.letters.filter((l) => l === data.targetLetter).length;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-8 text-center space-y-8">
      <p className="text-slate-500 dark:text-slate-400 text-sm">{item.prompt}</p>

      {phase === "intro" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#B45309]/20 bg-[#FEF4E7]0/5 p-4 text-left space-y-2">
            <p className="text-sm font-medium text-amber-400">Qoida:</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Har bir harf alohida ko&apos;rinadi. Faqat{" "}
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold text-lg mx-1">
                {data.targetLetter}
              </span>{" "}
              ko&apos;rganda ekranni bosing yoki{" "}
              <kbd className="rounded-lg bg-slate-100 dark:bg-[#1e2840] border border-slate-300 dark:border-white/10 px-2 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">Space</kbd>{" "}
              tugmasini bosing.
            </p>
          </div>
          <Button
            onClick={() => { setPhase("running"); runNextTrial(0); }}
            disabled={disabled}
            size="lg"
            className="bg-[#B45309] hover:bg-[#92400E] text-white border-0 shadow-lg shadow-[#1C1208]/12 px-10"
          >
            Boshlash
          </Button>
        </div>
      )}

      {phase === "running" && (
        <div
          className={cn(
            "mx-auto h-40 w-40 rounded-2xl flex items-center justify-center cursor-pointer select-none transition-all border-2",
            showLetter
              ? "bg-slate-200 dark:bg-[#1e2840] border-slate-400 dark:border-white/12"
              : "bg-slate-100 dark:bg-[#151f35] border-slate-200 dark:border-white/8"
          )}
          onClick={handleResponse}
        >
          {showLetter && (
            <span className="text-7xl font-bold text-slate-900 dark:text-white">
              {data.letters[currentLetterIdx]}
            </span>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-500">
            {data.letters.length} ta harf ko&apos;rsatildi, {targets} ta maqsadli
          </div>
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            className="bg-[#B45309] hover:bg-[#92400E] text-white border-0 px-10"
          >
            Davom etish →
          </Button>
        </div>
      )}
    </div>
  );
}
