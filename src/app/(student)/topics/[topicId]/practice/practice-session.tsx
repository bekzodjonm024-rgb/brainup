"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, ArrowLeft,
  ChevronRight, Loader2, Trophy, AlertCircle, Sparkles
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
  mastery: { score: number; level: string; label: string };
}

interface AIFeedback {
  feedback: string | null;
}

interface SessionStats {
  correct: number;
  total: number;
  mastery: number;
}

interface Props {
  topicId: string;
  topicTitle: string;
  courseId: string;
  courseTitle: string;
  totalQuestions: number;
  initialMastery: number;
  sessionTarget: number;
}

type Phase = "loading" | "question" | "feedback" | "complete" | "no-questions";

const DIFFICULTY_LABEL: Record<string, string> = {
  BASIC: "Asosiy",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Murakkab",
};
const DIFFICULTY_COLOR: Record<string, string> = {
  BASIC: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

export function PracticeSession({
  topicId, topicTitle, courseId, courseTitle,
  totalQuestions, initialMastery, sessionTarget,
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
    setStats((prev) => ({
      correct: prev.correct + (data.isCorrect ? 1 : 0),
      total: prev.total + 1,
      mastery: data.mastery.score,
    }));
    setSubmitting(false);
    setPhase("feedback");

    // Fetch AI feedback if answer is wrong and no explanation in DB
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
    if (stats.total >= sessionTarget) {
      setPhase("complete");
      return;
    }
    loadNextQuestion();
  }

  function handleFinish() {
    router.push(`/topics/${topicId}/result?topicId=${topicId}`);
  }

  // Keyboard shortcuts: 1-4 select option, Enter/Space submit or next
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

  const progress = (stats.total / sessionTarget) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.push(`/topics/${topicId}`)}
            className="text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-500 truncate">{topicTitle}</p>
            <Progress value={progress} className="h-1.5 mt-1" />
          </div>
          <span className="text-xs text-slate-500 shrink-0">
            {stats.total}/{sessionTarget}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">

          {/* Stats bar */}
          {stats.total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {stats.correct}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" /> {stats.total - stats.correct}
                </span>
              </div>
              <MasteryBadge score={stats.mastery} />
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

          {/* No questions */}
          {phase === "no-questions" && (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
                <p className="text-slate-600">Bu mavzu uchun savollar hali qo'shilmagan</p>
                <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
                  Kursga qaytish
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
                {/* Difficulty */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium rounded-full px-2.5 py-0.5",
                    DIFFICULTY_COLOR[currentQuestion.difficulty] ?? "bg-slate-100 text-slate-600"
                  )}>
                    {DIFFICULTY_LABEL[currentQuestion.difficulty] ?? currentQuestion.difficulty}
                  </span>
                </div>

                {/* Stem */}
                <p className="text-slate-900 font-medium leading-relaxed">
                  {currentQuestion.stem}
                </p>

                {/* Options */}
                {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx); // A, B, C, D
                      let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";

                      if (phase === "feedback") {
                        const isCorrectOption = String(option) === String(feedback?.correctAnswer);
                        const isSelected = selectedAnswer === option;

                        if (isCorrectOption) {
                          optionStyle = "border-emerald-400 bg-emerald-50 text-emerald-800";
                        } else if (isSelected && !isCorrectOption) {
                          optionStyle = "border-red-400 bg-red-50 text-red-800";
                        } else {
                          optionStyle = "border-slate-200 bg-slate-50 text-slate-400";
                        }
                      } else if (selectedAnswer === option) {
                        optionStyle = "border-blue-400 bg-blue-50 text-blue-800";
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => phase === "question" && setSelectedAnswer(option)}
                          disabled={phase === "feedback"}
                          className={cn(
                            "w-full text-left rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                            optionStyle
                          )}
                        >
                          <span className="font-bold mr-2">{letter}.</span>
                          {option}
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
                      let style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm transition-all border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                      if (phase === "feedback") {
                        const isCorrect = val === String(feedback?.correctAnswer);
                        const isSelected = selectedAnswer === val;
                        if (isCorrect) style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-emerald-400 bg-emerald-50 text-emerald-800";
                        else if (isSelected) style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-red-400 bg-red-50 text-red-800";
                        else style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-slate-200 bg-slate-50 text-slate-400";
                      } else if (selectedAnswer === val) {
                        style = "flex-1 rounded-lg border-2 py-3 font-medium text-sm border-blue-400 bg-blue-50 text-blue-800";
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
                      <span className={cn(
                        "text-sm font-semibold",
                        feedback.isCorrect ? "text-emerald-800" : "text-red-800"
                      )}>
                        {feedback.isCorrect ? "To'g'ri!" : "Noto'g'ri"}
                      </span>
                    </div>
                    {feedback.explanation && (
                      <p className="text-sm text-slate-700 pl-6">{feedback.explanation}</p>
                    )}
                    {/* AI feedback (when no DB explanation and answer was wrong) */}
                    {!feedback.isCorrect && !feedback.explanation && (
                      aiFeedbackLoading ? (
                        <div className="flex items-center gap-2 pl-6 text-xs text-violet-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          AI tahlil qilmoqda...
                        </div>
                      ) : aiFeedback ? (
                        <div className="pl-6 flex items-start gap-1.5 mt-1">
                          <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{aiFeedback}</p>
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
                      className="w-full"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Tasdiqlash
                    </Button>
                    <p className="text-center text-xs text-slate-400">
                      Raqam tugmalari variantni tanlaydi · Enter tasdiqlaydi
                    </p>
                  </div>
                )}

                {phase === "feedback" && (
                  <Button onClick={handleNext} className="w-full">
                    {stats.total >= sessionTarget ? "Natijani ko'rish" : "Keyingi savol"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session complete */}
          {phase === "complete" && (
            <Card>
              <CardContent className="p-8 text-center space-y-5">
                <Trophy className="mx-auto h-12 w-12 text-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Mashq yakunlandi!</h2>
                  <p className="text-slate-500 mt-1">
                    {stats.correct}/{stats.total} to'g'ri javob
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <MasteryBadge score={stats.mastery} />
                  <span className="text-sm text-slate-500">hozirgi mastery</span>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleFinish} className="flex-1">
                    Keyingi qadam <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sessionQuestionIds.current = [];
                      setStats({ correct: 0, total: 0, mastery: stats.mastery });
                      loadNextQuestion();
                    }}
                  >
                    Qayta mashq
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
