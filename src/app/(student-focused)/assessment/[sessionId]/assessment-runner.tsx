"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactionTimeTask } from "./tasks/reaction-time-task";
import { DigitSpanTask } from "./tasks/digit-span-task";
import { AttentionCPTTask } from "./tasks/attention-cpt-task";
import { WordRecognitionTask } from "./tasks/word-recognition-task";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { AlertCircle } from "lucide-react";

interface AssessmentItem {
  id: string;
  category: string;
  taskType: string;
  prompt: string;
  stimuluData: Record<string, unknown>;
}

interface AssessmentRunnerProps {
  sessionId: string;
  items: AssessmentItem[];
  initialItemIndex: number;
  totalItems: number;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  ATTENTION:       { label: "Diqqat",         color: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
  WORKING_MEMORY:  { label: "Ishchi xotira",  color: "bg-blue-500/15   text-blue-400   border-blue-500/25" },
  PROCESSING_SPEED:{ label: "Tezlik",         color: "bg-amber-500/15  text-amber-400  border-amber-500/25" },
  MEMORY:          { label: "Xotira",         color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
};

export function AssessmentRunner({ sessionId, items, initialItemIndex, totalItems }: AssessmentRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialItemIndex);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentItem = items[currentIndex];
  const progress = (currentIndex / totalItems) * 100;

  useEffect(() => {
    if (initialItemIndex >= items.length && items.length > 0) {
      fetch(`/api/assessment/${sessionId}/complete`, { method: "POST" })
        .then((res) => {
          if (res.ok || res.status === 400) {
            router.push("/assessment");
          } else {
            setError("Baholashni yakunlashda xatolik yuz berdi. Sahifani yangilang.");
          }
        })
        .catch(() => setError("Tarmoq xatosi. Sahifani yangilang."));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback(async (answer: unknown, responseTimeMs?: number) => {
    if (!currentItem || submitting) return;
    setSubmitting(true);
    setError(null);

    const ansRes = await fetch(`/api/assessment/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: currentItem.id,
        givenAnswer: answer,
        responseTimeMs,
      }),
    });

    if (!ansRes.ok) {
      setError("Javob saqlanmadi. Qayta urinib ko'ring.");
      setSubmitting(false);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= items.length) {
      const completeRes = await fetch(`/api/assessment/${sessionId}/complete`, { method: "POST" });
      if (!completeRes.ok && completeRes.status !== 400) {
        setError("Baholashni yakunlashda xatolik. Sahifani yangilang.");
        setSubmitting(false);
        return;
      }
      router.push("/assessment");
    } else {
      setCurrentIndex(nextIndex);
      setSubmitting(false);
    }
  }, [currentItem, currentIndex, items.length, sessionId, submitting, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-slate-300 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <p className="text-slate-500 text-sm">Baholash yakunlanmoqda...</p>
      </div>
    );
  }

  const catCfg = CATEGORY_LABELS[currentItem.category];

  return (
    <div className="flex flex-col min-h-full bg-slate-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-3.5">
        <div className="mx-auto max-w-xl flex items-center gap-4">
          <BrainUPLogo size="sm" href="/" />

          {/* Progress bar */}
          <div className="flex-1 relative">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <span className="text-xs text-slate-600 shrink-0 tabular-nums">
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      </div>

      {/* Task */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 pt-10">
        <div className="w-full max-w-xl space-y-5">
          {/* Category chip */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${catCfg?.color ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
              {catCfg?.label ?? currentItem.category}
            </span>
          </div>

          {currentItem.taskType === "REACTION_TIME" && (
            <ReactionTimeTask key={currentItem.id} item={currentItem} onComplete={handleAnswer} disabled={submitting} />
          )}
          {currentItem.taskType === "DIGIT_SPAN" && (
            <DigitSpanTask key={currentItem.id} item={currentItem} onComplete={handleAnswer} disabled={submitting} />
          )}
          {currentItem.taskType === "ATTENTION_CPT" && (
            <AttentionCPTTask key={currentItem.id} item={currentItem} onComplete={handleAnswer} disabled={submitting} />
          )}
          {currentItem.taskType === "WORD_RECOGNITION" && (
            <WordRecognitionTask key={currentItem.id} item={currentItem} onComplete={handleAnswer} disabled={submitting} />
          )}
        </div>
      </div>
    </div>
  );
}
