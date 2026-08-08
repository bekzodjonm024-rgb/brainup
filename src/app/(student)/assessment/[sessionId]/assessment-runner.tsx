"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactionTimeTask } from "./tasks/reaction-time-task";
import { DigitSpanTask } from "./tasks/digit-span-task";
import { AttentionCPTTask } from "./tasks/attention-cpt-task";
import { WordRecognitionTask } from "./tasks/word-recognition-task";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, AlertCircle } from "lucide-react";

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

const CATEGORY_LABELS: Record<string, string> = {
  ATTENTION: "Diqqat",
  WORKING_MEMORY: "Ishchi xotira",
  PROCESSING_SPEED: "Tezlik",
  MEMORY: "Xotira",
};

export function AssessmentRunner({ sessionId, items, initialItemIndex, totalItems }: AssessmentRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(initialItemIndex);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentItem = items[currentIndex];
  const progress = (currentIndex / totalItems) * 100;

  // If all items already answered but session not completed (e.g., network cut),
  // auto-complete on mount.
  useEffect(() => {
    if (initialItemIndex >= items.length && items.length > 0) {
      fetch(`/api/assessment/${sessionId}/complete`, { method: "POST" })
        .then((res) => {
          if (res.ok || res.status === 400) {
            // 400 = already completed, both are fine
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
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm p-6">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-slate-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 underline"
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Baholash yakunlanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-900 text-sm">BrainUP</span>
          </div>
          <div className="flex-1">
            <Progress value={progress} className="h-1.5" />
          </div>
          <span className="text-xs text-slate-500 shrink-0">
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      </div>

      {/* Task */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 pt-8">
        <div className="w-full max-w-2xl space-y-4">
          {/* Category label */}
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {CATEGORY_LABELS[currentItem.category] ?? currentItem.category}
            </span>
          </div>

          {/* Task renderer */}
          {currentItem.taskType === "REACTION_TIME" && (
            <ReactionTimeTask
              item={currentItem}
              onComplete={handleAnswer}
              disabled={submitting}
            />
          )}
          {currentItem.taskType === "DIGIT_SPAN" && (
            <DigitSpanTask
              item={currentItem}
              onComplete={handleAnswer}
              disabled={submitting}
            />
          )}
          {currentItem.taskType === "ATTENTION_CPT" && (
            <AttentionCPTTask
              item={currentItem}
              onComplete={handleAnswer}
              disabled={submitting}
            />
          )}
          {currentItem.taskType === "WORD_RECOGNITION" && (
            <WordRecognitionTask
              item={currentItem}
              onComplete={handleAnswer}
              disabled={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
