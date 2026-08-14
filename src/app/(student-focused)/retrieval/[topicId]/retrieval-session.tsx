"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, XCircle, ChevronRight,
  Loader2, RotateCcw, Calendar, AlertCircle,
} from "lucide-react";

interface Question {
  id: string; stem: string; type: string;
  options: string[] | null; difficulty: string;
}
interface AnswerFeedback {
  isCorrect: boolean; correctAnswer: unknown; explanation: string | null;
  mastery: { score: number };
}
interface CompleteResult {
  retrievalScore: number; nextIntervalDays: number;
  nextReviewDate: string; scheduled: boolean;
}
interface Props {
  topicId: string; topicTitle: string; courseTitle: string; recordId: string;
  intervalDays: number; initialMastery: number; initialRetrievalScore: number; sessionTarget: number;
}

type Phase = "loading" | "question" | "feedback" | "completing" | "done" | "no-questions";

const INTERVAL_LABEL: Record<number, string> = { 3: "3 kun", 7: "1 hafta", 14: "2 hafta", 30: "1 oy" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

export function RetrievalSession({
  topicId, topicTitle, courseTitle, recordId,
  intervalDays, initialMastery, sessionTarget,
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
    if (sessionQuestionIds.current.length > 0) params.set("sessionIds", sessionQuestionIds.current.join(","));

    const res = await fetch(`/api/practice/next?${params}`);
    const data = await res.json();

    if (!data.question) { setPhase("no-questions"); return; }
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
      body: JSON.stringify({ questionId: currentQuestion.id, topicId, givenAnswer: selectedAnswer, responseTimeMs: rt }),
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
    if (newTotal >= sessionTarget) { await completeRetrieval(); return; }
    loadNextQuestion();
  }

  async function completeRetrieval() {
    setPhase("completing");
    const res = await fetch("/api/retrieval/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordId, topicId,
        correctCount: correct + (feedback?.isCorrect ? 1 : 0),
        totalCount: total + 1,
      }),
    });
    const data: CompleteResult = await res.json();
    setResult(data);
    setPhase("done");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "question" && currentQuestion) {
        if (currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < currentQuestion.options.length) { setSelectedAnswer(currentQuestion.options[idx]); return; }
        }
        if (currentQuestion.type === "TRUE_FALSE") {
          if (e.key === "1") { setSelectedAnswer("true"); return; }
          if (e.key === "2") { setSelectedAnswer("false"); return; }
        }
        if ((e.code === "Enter" || e.code === "Space") && selectedAnswer && !submitting) { e.preventDefault(); handleSubmit(); }
      } else if (phase === "feedback") {
        if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); handleNext(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion, selectedAnswer, submitting]);

  const progress = (total / sessionTarget) * 100;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  function getOptionStyle(option: string) {
    if (phase === "feedback") {
      const isCorrect = String(option) === String(feedback?.correctAnswer);
      const isSelected = selectedAnswer === option;
      if (isCorrect)   return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      if (isSelected)  return "border-red-500/40    bg-red-500/10    text-red-300";
      return "border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-[#17130E]/50 text-slate-400 dark:text-slate-600";
    }
    if (selectedAnswer === option) return "border-violet-500/40 bg-violet-500/10 text-violet-300";
    return "border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2720] hover:border-slate-300 dark:hover:border-slate-700";
  }

  function getTFStyle(val: string) {
    if (phase === "feedback") {
      if (val === String(feedback?.correctAnswer)) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      if (selectedAnswer === val)                  return "border-red-500/40    bg-red-500/10    text-red-300";
      return "border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-[#17130E]/50 text-slate-400 dark:text-slate-600";
    }
    if (selectedAnswer === val) return "border-violet-500/40 bg-violet-500/10 text-violet-300";
    return "border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2720] hover:border-slate-300 dark:hover:border-slate-700";
  }

  void initialMastery;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8faff] dark:bg-[#100D09]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-white/8 px-5 py-3.5">
        <div className="mx-auto max-w-xl flex items-center gap-4">
          <button onClick={() => router.push("/retrieval")} className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <RotateCcw className="h-3 w-3 text-violet-400" />
              <p className="text-xs text-violet-400 font-medium">Takrorlash sessiyasi</p>
            </div>
            <div className="h-1 bg-slate-200 dark:bg-[#1C1710] rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0 tabular-nums">{total}/{sessionTarget}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl space-y-4">

          {/* Topic info */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{topicTitle}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">
              {courseTitle} · Interval: {INTERVAL_LABEL[intervalDays] ?? `${intervalDays} kun`}
            </p>
          </div>

          {/* Stats */}
          {total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> {correct}</span>
                <span className="flex items-center gap-1.5 text-red-400"><XCircle className="h-4 w-4" /> {total - correct}</span>
              </div>
              <span className="text-xs text-slate-500">{accuracy}% aniqlik</span>
            </div>
          )}

          {/* Loading */}
          {(phase === "loading" || phase === "completing") && (
            <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] py-16 flex flex-col items-center gap-3">
              <Loader2 className={cn("h-6 w-6 animate-spin", phase === "completing" ? "text-violet-400" : "text-slate-400 dark:text-slate-600")} />
              {phase === "completing" && <p className="text-sm text-slate-500">Natijalar saqlanmoqda...</p>}
            </div>
          )}

          {/* No questions */}
          {phase === "no-questions" && (
            <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#1C1710] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">Bu mavzu uchun savollar topilmadi</p>
              <Button variant="outline" onClick={() => router.push("/retrieval")} className="border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent">
                Orqaga qaytish
              </Button>
            </div>
          )}

          {/* Question + Feedback */}
          {(phase === "question" || phase === "feedback") && currentQuestion && (
            <div className={cn(
              "rounded-2xl border bg-white dark:bg-[#17130E] p-6 space-y-5 transition-all",
              phase === "feedback" && feedback?.isCorrect  ? "border-emerald-500/30" :
              phase === "feedback" && feedback             ? "border-red-500/30"     : "border-slate-200 dark:border-white/8"
            )}>
              <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{currentQuestion.stem}</p>

              {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => phase === "question" && setSelectedAnswer(option)}
                      disabled={phase === "feedback"}
                      className={cn("w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all", getOptionStyle(option))}
                    >
                      <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span>{option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === "TRUE_FALSE" && (
                <div className="flex gap-3">
                  {["To'g'ri", "Noto'g'ri"].map((opt, idx) => {
                    const val = idx === 0 ? "true" : "false";
                    return (
                      <button
                        key={val}
                        onClick={() => phase === "question" && setSelectedAnswer(val)}
                        disabled={phase === "feedback"}
                        className={cn("flex-1 rounded-xl border-2 py-3 font-medium text-sm transition-all", getTFStyle(val))}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {phase === "feedback" && feedback && (
                <div className={cn(
                  "rounded-xl border p-4 space-y-2",
                  feedback.isCorrect ? "border-emerald-500/25 bg-emerald-500/8" : "border-red-500/25 bg-red-500/8"
                )}>
                  <div className="flex items-center gap-2">
                    {feedback.isCorrect
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      : <XCircle className="h-4 w-4 text-red-400" />}
                    <span className={cn("text-sm font-semibold", feedback.isCorrect ? "text-emerald-400" : "text-red-400")}>
                      {feedback.isCorrect ? "To'g'ri esladingiz!" : "Eslay olmadingiz"}
                    </span>
                  </div>
                  {feedback.explanation && <p className="text-sm text-slate-500 dark:text-slate-400 pl-6">{feedback.explanation}</p>}
                </div>
              )}

              {phase === "question" && (
                <div className="space-y-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || submitting}
                    className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white border-0"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Tasdiqlash
                  </Button>
                  <p className="text-center text-xs text-slate-300 dark:text-slate-700">
                    Raqam tugmalari variantni tanlaydi · Enter tasdiqlaydi
                  </p>
                </div>
              )}

              {phase === "feedback" && (
                <Button onClick={handleNext} className="w-full h-11 bg-slate-100 dark:bg-[#1C1710] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border-0">
                  {total + 1 >= sessionTarget ? "Takrorlashni yakunlash" : "Keyingi savol"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Done */}
          {phase === "done" && result && (
            <div className="rounded-2xl border border-violet-500/20 bg-white dark:bg-[#17130E] p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                <RotateCcw className="h-8 w-8 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Takrorlash yakunlandi!</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  {correct + (feedback?.isCorrect ? 1 : 0)}/{total + 1} savol to&apos;g&apos;ri
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-slate-950 p-4 space-y-3 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Eslab qolish darajasi</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{Math.round(result.retrievalScore * 100)}%</span>
                </div>
                {result.scheduled ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Keyingi takrorlash
                    </span>
                    <span className="font-semibold text-violet-400">
                      {formatDate(result.nextReviewDate)} ({INTERVAL_LABEL[result.nextIntervalDays] ?? `${result.nextIntervalDays} kun`})
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-amber-400">Natija past — tez orada qayta mashq qilishingiz tavsiya etiladi.</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/retrieval")} className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Takrorlash ro&apos;yxati
                </Button>
                <Button variant="outline" onClick={() => router.push(`/topics/${topicId}`)} className="flex-1 border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent">
                  Mavzuni o&apos;qish
                </Button>
              </div>
            </div>
          )}

          {/* Mastery badge if available */}
          {phase !== "done" && initialMastery > 0 && (
            <div className="flex justify-center">
              <MasteryBadge score={initialMastery} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
