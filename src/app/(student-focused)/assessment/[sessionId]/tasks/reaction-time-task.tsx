"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  item: { id: string; prompt: string; stimuluData: Record<string, unknown> };
  onComplete: (answer: unknown, rtMs?: number) => void;
  disabled: boolean;
}

type Phase = "ready" | "waiting" | "stimulus" | "too-early" | "done";

export function ReactionTimeTask({ item, onComplete, disabled }: Props) {
  const stimuluData = item.stimuluData as { delayRange: [number, number]; timeoutMs: number };
  const [phase, setPhase] = useState<Phase>("ready");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const stimulusStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const startTrial = useCallback(() => {
    setPhase("waiting");
    const [min, max] = stimuluData.delayRange;
    const delay = Math.random() * (max - min) + min;
    timerRef.current = setTimeout(() => {
      setPhase("stimulus");
      stimulusStartRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        setPhase("done");
        setReactionTime(null);
      }, stimuluData.timeoutMs);
    }, delay);
  }, [stimuluData]);

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (phase !== "waiting" && phase !== "stimulus") return;
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); handleClick(); }
    }
    window.addEventListener("keydown", onKey as unknown as EventListener);
    return () => window.removeEventListener("keydown", onKey as unknown as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleClick() {
    if (disabled) return;
    if (phase === "waiting") { clearTimer(); setPhase("too-early"); return; }
    if (phase === "stimulus") {
      clearTimer();
      const rt = Date.now() - (stimulusStartRef.current ?? Date.now());
      setReactionTime(rt);
      setPhase("done");
    }
  }

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => {
      onComplete(
        { taskType: "REACTION_TIME", category: "PROCESSING_SPEED", targetShown: true, responded: reactionTime !== null, reactionTimeMs: reactionTime },
        reactionTime ?? undefined
      );
    }, 1200);
    return () => clearTimeout(t);
  }, [phase, reactionTime, onComplete]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-8 text-center space-y-8">
      <p className="text-slate-500 dark:text-slate-400 text-sm">{item.prompt}</p>

      {phase === "ready" && (
        <Button
          onClick={startTrial}
          disabled={disabled}
          size="lg"
          className="bg-[#B45309] hover:bg-[#92400E] text-white border-0 shadow-lg shadow-[#1C1208]/12 px-10"
        >
          Boshlash
        </Button>
      )}

      {phase === "waiting" && (
        <div
          className="mx-auto h-36 w-36 rounded-full bg-slate-200 dark:bg-[#1e2840] border-2 border-slate-300 dark:border-white/10 flex items-center justify-center cursor-pointer select-none"
          onClick={handleClick}
        >
          <span className="text-slate-500 text-sm">Kuting...</span>
        </div>
      )}

      {phase === "stimulus" && (
        <div
          className="mx-auto h-36 w-36 rounded-full bg-emerald-500 border-2 border-emerald-400 flex items-center justify-center cursor-pointer select-none shadow-xl shadow-emerald-500/30"
          onClick={handleClick}
        >
          <span className="text-white font-bold text-lg">BOSING!</span>
        </div>
      )}

      {phase === "too-early" && (
        <div className="space-y-6">
          <div className="mx-auto h-36 w-36 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-sm font-medium">Juda erta!</span>
          </div>
          <Button
            onClick={startTrial}
            variant="outline"
            className="border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent"
          >
            Qayta urinish
          </Button>
        </div>
      )}

      {phase === "done" && (
        <div className="mx-auto h-36 w-36 rounded-full bg-[#FEF4E7]0/10 border-2 border-[#B45309]/20 flex items-center justify-center">
          {reactionTime ? (
            <div>
              <p className="text-3xl font-bold text-amber-400">{reactionTime}</p>
              <p className="text-xs text-slate-500">ms</p>
            </div>
          ) : (
            <span className="text-slate-500 text-sm">Vaqt o&apos;tdi</span>
          )}
        </div>
      )}
    </div>
  );
}
