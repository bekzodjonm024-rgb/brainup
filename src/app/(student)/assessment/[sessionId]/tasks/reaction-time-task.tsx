"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      // Auto-timeout
      timerRef.current = setTimeout(() => {
        setPhase("done");
        setReactionTime(null);
      }, stimuluData.timeoutMs);
    }, delay);
  }, [stimuluData]);

  useEffect(() => () => clearTimer(), []);

  function handleClick() {
    if (disabled) return;
    if (phase === "waiting") {
      clearTimer();
      setPhase("too-early");
      return;
    }
    if (phase === "stimulus") {
      clearTimer();
      const rt = Date.now() - (stimulusStartRef.current ?? Date.now());
      setReactionTime(rt);
      setPhase("done");
    }
  }

  // Auto-advance after showing result (1.2s)
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
    <Card>
      <CardContent className="p-8 text-center space-y-6">
        <p className="text-slate-700 text-sm">{item.prompt}</p>

        {phase === "ready" && (
          <Button onClick={startTrial} disabled={disabled} size="lg">
            Boshlash
          </Button>
        )}

        {phase === "waiting" && (
          <div
            className="mx-auto h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer select-none"
            onClick={handleClick}
          >
            <span className="text-slate-400 text-sm">Kuting...</span>
          </div>
        )}

        {phase === "stimulus" && (
          <div
            className="mx-auto h-32 w-32 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer select-none"
            onClick={handleClick}
          >
            <span className="text-white font-bold text-lg">BOSING!</span>
          </div>
        )}

        {phase === "too-early" && (
          <div className="space-y-4">
            <div className="mx-auto h-32 w-32 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-700 text-sm font-medium">Juda erta!</span>
            </div>
            <Button onClick={startTrial} variant="outline">Qayta urinish</Button>
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-4">
            <div className="mx-auto h-32 w-32 rounded-full bg-blue-50 flex items-center justify-center">
              {reactionTime ? (
                <div>
                  <p className="text-2xl font-bold text-blue-700">{reactionTime}</p>
                  <p className="text-xs text-blue-500">ms</p>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Vaqt o'tdi</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
