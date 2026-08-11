"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, XCircle, ChevronRight,
  Loader2, RotateCcw, Calendar, AlertCircle
} from "lucide-react";

interface Question {
  id: string;
  stem: string;
  type: string;
  options: string[] | null;
  difficulty: string;
}

interface AnswerFeedback {
  isCorrect: boolean;
  correctAnswer: unknown;
  explanation: string | null;
  mastery: { score: number };
}

interface CompleteResult {
  retrievalScore: number;
  nextIntervalDays: number;
  nextReviewDate: string;
  scheduled: boolean;
}

interface Props {
  topicId: string;
  topicTitle: string;
  courseTitle: string;
  recordId: string;
  intervalDays: number;
  initialMastery: number;
  initialRetrievalScore: number;
  sessionTarget: number;
}

type Phase = "loading" | "question" | "feedback" | "completing" | "done" | "no-questions";

const INTERVAL_LABEL: Record<number, string> = {
  3: "3 kun", 7: "1 hafta", 14: "2 hafta", 30: "1 oy",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function RetrievalSession({
  topicId, topicTitle, courseTitle, recordId,
  intervalDays, initialMastery, initialRetrievalScore, sessionTarget,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const sessionQuestionIds = useRef<string[]>([]);
  const startTime = useRef<number>(0);

  const loadNextQuestion = useCallback(async () => {
    setPhase("loading");
    setSelectedAnswer(null);
    setFeedback(null);

    const params = new URLSearchParams({ topicId });
    if (sessionQuestionIds.current.length > 0) {
      params.set("sessionIds", sessionQuestionIds.current.join(","));
    }

    const res = await fetch(`/api/practice/next?${params}`);
    const data = await res.json();

    if (!data.question) {
      setPhase("no-questions");
      return;
    }

    setCurrentQuestion(data.question);
    startTime.current = Date.now();
    setPhase("question");
  }, [topicId]);

  useEffect(() => { loadNextQuestion(); }, [loadNextQuestion]);

  async function handleSubmit() {
    if (!currentQuestion || !selectedAnswer || submitting) return;
    setSubmitting(true);

    const rt = Date.now() - startTime.current;
    const res = await fetch("/api/practice/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        topicId,
        givenAnswer: selectedAnswer,
        responseTimeMs: rt,
      }),
    });

    const data: AnswerFeedback = await res.json();
    sessionQuestionIds.current.push(currentQuestion.id);

    setFeedback(data);
    setCorrect((c) => c + (data.isCorrect ? 1 : 0));
    setTotal((t) => t + 1);
    setSubmitting(false);
    setPhase("feedback");
  }

  async function handleNext() {
    const newTotal = total + 1;
    if (newTotal >= sessionTarget) {
      await completeRetrieval();
      return;
    }
    loadNextQuestion();
  }

  async function completeRetrieval() {
    setPhase("completing");
    const res = await fetch("/api/retrieval/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordId,
        topicId,
        correctCount: correct + (feedback?.isCorrect ? 1 : 0),
        totalCount: total + 1,
      }),
    });
    const data: CompleteResult = await res.json();
    setResult(data);
    setPhase("done");
  }

  // Keyboard: 1-4 select option, Enter/Space submit or next
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "question" && currentQuestion) {
        if (currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < currentQuestion.options.length) {
            setSelectedAnswer(currentQuestion.options[idx]);
            return;
          }
        }
        if (currentQuestion.type === "TRUE_FALSE") {
          if (e.key === "1") { setSelectedAnswer("true"); return; }
          if (e.key === "2") { setSelectedAnswer("false"); return; }
        }
        if ((e.code === "Enter" || e.code === "Space") && selectedAnswer && !submitting) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (phase === "feedback") {
        if (e.code === "Enter" || e.code === "Space") {
          e.preventDefault();
          handleNext();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion, selectedAnswer, submitting]);

  const progress = (total / sessionTarget) * 100;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push("/retrieval")}
            className="text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-purple-500" />
              <p className="text-xs text-purple-600 font-medium">Takrorlash sessiyasi</p>
            </div>
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>
          <span className="text-xs text-slate-500 shrink-0">
            {total}/{sessionTarget}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">

          {/* Topic info */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">{topicTitle}</p>
            <p className="text-xs text-slate-400">{courseTitle} • Interval: {INTERVAL_LABEL[intervalDays] ?? `${intervalDays} kun`}</p>
          </div>

          {/* Stats bar */}
          {total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {correct}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" /> {total - correct}
                </span>
              </div>
              <span className="text-xs text-slate-500">{accuracy}% aniqlik</span>
            </div>
          )}

          {/* Loading */}
          {phase === "loading" && (
            <Card>
              <CardContent className="py-16 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </CardContent>
            </Card>
          )}

          {/* Completing */}
          {phase === "completing" && (
            <Card>
              <CardContent className="py-16 flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <p className="text-sm text-slate-500">Natijalar saqlanmoqda...</p>
              </CardContent>
            </Card>
          )}

          {/* No questions */}
          {phase === "no-questions" && (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
                <p className="text-slate-600">Bu mavzu uchun savollar topilmadi</p>
                <Button variant="outline" onClick={() => router.push("/retrieval")}>
                  Orqaga qaytish
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Question */}
          {(phase === "question" || phase === "feedback") && currentQuestion && (
            <Card className={cn(
              "transition-all",
              phase === "feedback" && feedback?.isCorrect && "border-emerald-200",
              phase === "feedback" && feedback && !feedback.isCorrect && "border-red-200"
            )}>
              <CardContent className="p-6 space-y-5">
                <p className="text-slate-900 font-medium leading-relaxed">
                  {currentQuestion.stem}
                </p>

                {/* Multiple choice */}
                {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      let style = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                      if (phase === "feedback") {
                        const isCorrectOption = String(option) === String(feedback?.correctAnswer);
                        const isSelected = selectedAnswer === option;
                        if (isCorrectOption) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
                        else if (isSelected) style = "border-red-400 bg-red-50 text-red-800";
                        else style = "border-slate-200 bg-slate-50 text-slate-400";
                      } else if (selectedAnswer === option) {
                        style = "border-purple-400 bg-purple-50 text-purple-800";
                      }
                      return (
                        <button
                          key={option}
                          onClick={() => phase === "question" && setSelectedAnswer(option)}
                          disabled={phase === "feedback"}
                          className={cn("w-full text-left rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all", style)}
                        >
                          <span className="font-bold mr-2">{letter}.</span>{option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === "TRUE_FALSE" && (
                  <div className="flex gap-3">
                    {["To'g'ri", "Noto'g'ri"].map((opt, idx) => {
                      const val = idx === 0 ? "true" : "false";
                      let style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                      if (phase === "feedback") {
                        const isCorrect = val === String(feedback?.correctAnswer);
                        const isSelected = selectedAnswer === val;
                        if (isCorrect) style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-emerald-400 bg-emerald-50 text-emerald-800";
                        else if (isSelected) style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-red-400 bg-red-50 text-red-800";
                        else style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-slate-200 bg-slate-50 text-slate-400";
                      } else if (selectedAnswer === val) {
                        style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-purple-400 bg-purple-50 text-purple-800";
                      }
                      return (
                        <button
                          key={val}
                          onClick={() => phase === "question" && setSelectedAnswer(val)}
                          disabled={phase === "feedback"}
                          className={style}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback */}
                {phase === "feedback" && feedback && (
                  <div className={cn(
                    "rounded-lg border p-4 space-y-1",
                    feedback.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                  )}>
                    <div className="flex items-center gap-2">
                      {feedback.isCorrect
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        : <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className={cn("text-sm font-semibold", feedback.isCorrect ? "text-emerald-800" : "text-red-800")}>
                        {feedback.isCorrect ? "To'g'ri esladingiz!" : "Eslay olmadingiz"}
                      </span>
                    </div>
                    {feedback.explanation && (
                      <p className="text-sm text-slate-700 pl-6">{feedback.explanation}</p>
                    )}
                  </div>
                )}

                {phase === "question" && (
                  <div className="space-y-2">
                    <Button onClick={handleSubmit} disabled={!selectedAnswer || submitting} className="w-full bg-purple-600 hover:bg-purple-700">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Tasdiqlash
                    </Button>
                    <p className="text-center text-xs text-slate-400">
                      Raqam tugmalari variantni tanlaydi · Enter tasdiqlaydi
                    </p>
                  </div>
                )}

                {phase === "feedback" && (
                  <Button onClick={handleNext} className="w-full bg-purple-600 hover:bg-purple-700">
                    {total + 1 >= sessionTarget ? "Takrorlashni yakunlash" : "Keyingi savol"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Done */}
          {phase === "done" && result && (
            <Card className="border-purple-200">
              <CardContent className="p-8 text-center space-y-5">
                <div className="mx-auto h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <RotateCcw className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Takrorlash yakunlandi!</h2>
                  <p className="text-slate-500 mt-1">
                    {correct + (feedback?.isCorrect ? 1 : 0)}/{total + 1} savol to'g'ri
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border p-4 space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Eslab qolish darajasi</span>
                    <span className="font-semibold text-slate-800">
                      {Math.round(result.retrievalScore * 100)}%
                    </span>
                  </div>
                  {result.scheduled ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Keyingi takrorlash
                      </span>
                      <span className="font-semibold text-purple-700">
                        {formatDate(result.nextReviewDate)} ({INTERVAL_LABEL[result.nextIntervalDays] ?? `${result.nextIntervalDays} kun`})
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600">
                      Natija past — tez orada qayta mashq qilishingiz tavsiya etiladi.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/retrieval")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Takrorlash ro'yxati
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/topics/${topicId}`)}
                    className="flex-1"
                  >
                    Mavzuni o'qish
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
