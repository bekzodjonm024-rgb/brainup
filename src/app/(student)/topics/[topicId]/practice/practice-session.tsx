"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, ArrowLeft, ChevronRight,
  Loader2, Trophy, AlertCircle, Sparkles,
} from "lucide-react";

interface Question {
  id: string; stem: string; type: string;
  options: string[] | null; difficulty: string;
}
interface AnswerFeedback {
  isCorrect: boolean; correctAnswer: unknown; explanation: string | null;
  mastery: { score: number; level: string; label: string };
}
interface AIFeedback { feedback: string | null }
interface SessionStats { correct: number; total: number; mastery: number }
interface Props {
  topicId: string; topicTitle: string; courseId: string; courseTitle: string;
  totalQuestions: number; initialMastery: number; sessionTarget: number;
}

type Phase = "loading" | "question" | "feedback" | "complete" | "no-questions";

const DIFF_STYLE: Record<string, string> = {
  BASIC:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  INTERMEDIATE: "bg-amber-500/15  text-amber-400  border-amber-500/25",
  ADVANCED:     "bg-red-500/15    text-red-400    border-red-500/25",
};
const DIFF_LABEL: Record<string, string> = {
  BASIC: "Asosiy", INTERMEDIATE: "O'rta", ADVANCED: "Murakkab",
};

export function PracticeSession({
  topicId, topicTitle, courseId, totalQuestions, initialMastery, sessionTarget,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [stats, setStats] = useState<SessionStats>({ correct: 0, total: 0, mastery: initialMastery });
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const sessionQuestionIds = useRef<string[]>([]);
  const questionStartTime = useRef<number>(0);

  const loadNextQuestion = useCallback(async () => {
    setPhase("loading");
    setSelectedAnswer(null);
    setFeedback(null);
    setAiFeedback(null);

    const params = new URLSearchParams({ topicId });
    if (sessionQuestionIds.current.length > 0) params.set("sessionIds", sessionQuestionIds.current.join(","));

    const res = await fetch(`/api/practice/next?${params}`);
    const data = await res.json();

    if (!data.question) { setPhase("no-questions"); return; }
    setCurrentQuestion(data.question);
    questionStartTime.current = Date.now();
    setPhase("question");
  }, [topicId]);

  useEffect(() => { loadNextQuestion(); }, [loadNextQuestion]);

  async function handleSubmit() {
    if (!currentQuestion || !selectedAnswer || submitting) return;
    setSubmitting(true);

    const rt = Date.now() - questionStartTime.current;
    const res = await fetch("/api/practice/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id, topicId, givenAnswer: selectedAnswer, responseTimeMs: rt }),
    });

    const data: AnswerFeedback = await res.json();
    sessionQuestionIds.current.push(currentQuestion.id);
    setFeedback(data);
    setStats((prev) => ({ correct: prev.correct + (data.isCorrect ? 1 : 0), total: prev.total + 1, mastery: data.mastery.score }));
    setSubmitting(false);
    setPhase("feedback");

    if (!data.isCorrect && !data.explanation) {
      setAiFeedbackLoading(true);
      fetch("/api/ai/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, studentAnswer: selectedAnswer }),
      })
        .then((r) => r.json())
        .then((r: AIFeedback) => { if (r.feedback) setAiFeedback(r.feedback); })
        .catch(() => {})
        .finally(() => setAiFeedbackLoading(false));
    }
  }

  function handleNext() {
    if (stats.total >= sessionTarget) { setPhase("complete"); return; }
    loadNextQuestion();
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

  const progress = (stats.total / sessionTarget) * 100;

  function getOptionStyle(option: string) {
    if (phase === "feedback") {
      const isCorrectOption = String(option) === String(feedback?.correctAnswer);
      const isSelected = selectedAnswer === option;
      if (isCorrectOption) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      if (isSelected)      return "border-red-500/40    bg-red-500/10    text-red-300";
      return "border-slate-800 bg-slate-900/50 text-slate-600";
    }
    if (selectedAnswer === option) return "border-blue-500/40 bg-blue-500/10 text-blue-300";
    return "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:border-slate-700";
  }

  function getTFStyle(val: string) {
    if (phase === "feedback") {
      if (val === String(feedback?.correctAnswer)) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
      if (selectedAnswer === val)                  return "border-red-500/40    bg-red-500/10    text-red-300";
      return "border-slate-800 bg-slate-900/50 text-slate-600";
    }
    if (selectedAnswer === val) return "border-blue-500/40 bg-blue-500/10 text-blue-300";
    return "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:border-slate-700";
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-3.5">
        <div className="mx-auto max-w-xl flex items-center gap-4">
          <button
            onClick={() => router.push(`/topics/${topicId}`)}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-600 truncate mb-1">{topicTitle}</p>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-slate-600 shrink-0 tabular-nums">{stats.total}/{sessionTarget}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl space-y-4">

          {/* Stats bar */}
          {stats.total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> {stats.correct}
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <XCircle className="h-4 w-4" /> {stats.total - stats.correct}
                </span>
              </div>
              <MasteryBadge score={stats.mastery} />
            </div>
          )}

          {/* Loading */}
          {phase === "loading" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 py-16 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          )}

          {/* No questions */}
          {phase === "no-questions" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">Bu mavzu uchun savollar hali qo&apos;shilmagan</p>
              <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)} className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
                Kursga qaytish
              </Button>
            </div>
          )}

          {/* Question + Feedback */}
          {(phase === "question" || phase === "feedback") && currentQuestion && (
            <div className={cn(
              "rounded-2xl border bg-slate-900 p-6 space-y-5 transition-all",
              phase === "feedback" && feedback?.isCorrect  ? "border-emerald-500/30" :
              phase === "feedback" && feedback             ? "border-red-500/30"     : "border-slate-800"
            )}>
              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium rounded-full border px-2.5 py-0.5",
                  DIFF_STYLE[currentQuestion.difficulty] ?? "bg-slate-800 text-slate-400 border-slate-700"
                )}>
                  {DIFF_LABEL[currentQuestion.difficulty] ?? currentQuestion.difficulty}
                </span>
              </div>

              {/* Stem */}
              <p className="text-slate-200 font-medium leading-relaxed">{currentQuestion.stem}</p>

              {/* Multiple choice */}
              {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={option}
                      onClick={() => phase === "question" && setSelectedAnswer(option)}
                      disabled={phase === "feedback"}
                      className={cn("w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all", getOptionStyle(option))}
                    >
                      <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
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

              {/* Feedback panel */}
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
                      {feedback.isCorrect ? "To'g'ri!" : "Noto'g'ri"}
                    </span>
                  </div>
                  {feedback.explanation && (
                    <p className="text-sm text-slate-400 pl-6">{feedback.explanation}</p>
                  )}
                  {!feedback.isCorrect && !feedback.explanation && (
                    aiFeedbackLoading ? (
                      <div className="flex items-center gap-2 pl-6 text-xs text-violet-400">
                        <Loader2 className="h-3 w-3 animate-spin" /> AI tahlil qilmoqda...
                      </div>
                    ) : aiFeedback ? (
                      <div className="pl-6 flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-400">{aiFeedback}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Actions */}
              {phase === "question" && (
                <div className="space-y-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || submitting}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white border-0"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Tasdiqlash
                  </Button>
                  <p className="text-center text-xs text-slate-700">
                    Raqam tugmalari variantni tanlaydi · Enter tasdiqlaydi
                  </p>
                </div>
              )}

              {phase === "feedback" && (
                <Button onClick={handleNext} className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 border-0">
                  {stats.total >= sessionTarget ? "Natijani ko'rish" : "Keyingi savol"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Complete */}
          {phase === "complete" && (
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="f-syne text-xl font-bold text-white">Mashq yakunlandi!</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  {stats.correct}/{stats.total} to&apos;g&apos;ri javob
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MasteryBadge score={stats.mastery} />
                <span className="text-sm text-slate-500">hozirgi mastery</span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/topics/${topicId}/result?topicId=${topicId}`)}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white border-0"
                >
                  Keyingi qadam <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent"
                  onClick={() => {
                    sessionQuestionIds.current = [];
                    setStats({ correct: 0, total: 0, mastery: stats.mastery });
                    loadNextQuestion();
                  }}
                >
                  Qayta
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
