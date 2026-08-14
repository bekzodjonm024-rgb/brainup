"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedQuestion {
  stem: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "BASIC" | "INTERMEDIATE" | "ADVANCED";
}

const DIFF_LABEL = { BASIC: "Asosiy", INTERMEDIATE: "O'rta", ADVANCED: "Murakkab" };
const DIFF_COLOR = {
  BASIC: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-amber-100 text-amber-700",
  ADVANCED: "bg-red-100 text-red-700",
};

export function GenerateQuestionsDialog({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "generating" | "review" | "saving" | "done" | "error">("idle");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  async function generate() {
    setPhase("generating");
    setRemoved(new Set());
    setErrorMsg("");

    const res = await fetch("/api/ai/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, count: 5 }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? "Xato yuz berdi");
      setPhase("error");
      return;
    }

    setQuestions(data.questions);
    setPhase("review");
  }

  function remove(idx: number) {
    setRemoved((prev) => new Set([...prev, idx]));
  }

  async function save() {
    const toSave = questions.filter((_, i) => !removed.has(i));
    if (toSave.length === 0) return;

    setPhase("saving");
    const res = await fetch("/api/ai/save-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, questions: toSave }),
    });

    const data = await res.json();
    if (res.ok) {
      setSavedCount(data.saved);
      setPhase("done");
      router.refresh();
    } else {
      setErrorMsg(data.error ?? "Saqlashda xato");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setQuestions([]);
    setRemoved(new Set());
    setErrorMsg("");
  }

  const activeCount = questions.filter((_, i) => !removed.has(i)).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
          AI savol yaratish
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            AI yordamida savollar yaratish
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Idle */}
          {phase === "idle" && (
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-5 space-y-3">
              <p className="text-sm text-violet-800">
                Mavzuning tasdiqlangan materiallaridan foydalanib, Claude AI avtomatik ravishda
                <strong> 5 ta test savoli</strong> yaratadi. Savollarni ko'rib chiqib, keraklilarini saqlaysiz.
              </p>
              <p className="text-xs text-violet-600">
                Talab: kamida bitta APPROVED material bo'lishi kerak.
              </p>
              <Button onClick={generate} className="bg-violet-600 hover:bg-violet-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Savollar yaratish
              </Button>
            </div>
          )}

          {/* Generating */}
          {phase === "generating" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm text-stone-600">Claude AI savollar yaratmoqda...</p>
              <p className="text-xs text-stone-400">Bu 10–20 soniya vaqt oladi</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
              <Button variant="outline" onClick={reset}>Qayta urinish</Button>
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-medium text-[#1C1208]">{savedCount} ta savol saqlandi!</p>
              <p className="text-sm text-stone-500">Talabalar endi bu savollarni mashq sifatida yechadi.</p>
              <Button onClick={() => setOpen(false)}>Yopish</Button>
            </div>
          )}

          {/* Review */}
          {(phase === "review" || phase === "saving") && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  {activeCount} ta savol tanlangan
                  <span className="text-stone-400 ml-1">({questions.length} dan)</span>
                </p>
                <Button
                  variant="ghost" size="sm"
                  onClick={generate}
                  disabled={phase === "saving"}
                  className="text-xs text-violet-600"
                >
                  <Sparkles className="h-3 w-3 mr-1" /> Qayta yaratish
                </Button>
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isRemoved = removed.has(idx);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-lg border p-4 space-y-3 transition-all",
                        isRemoved ? "opacity-40 bg-stone-50" : "bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-stone-400">{idx + 1}</span>
                          <span className={cn(
                            "text-xs font-medium rounded-full px-2 py-0.5",
                            DIFF_COLOR[q.difficulty]
                          )}>
                            {DIFF_LABEL[q.difficulty]}
                          </span>
                        </div>
                        <button
                          onClick={() => isRemoved ? setRemoved((p) => { const n = new Set(p); n.delete(idx); return n; }) : remove(idx)}
                          className={cn(
                            "shrink-0 p-1 rounded hover:bg-stone-100 transition-colors",
                            isRemoved ? "text-emerald-500" : "text-stone-400 hover:text-red-400"
                          )}
                        >
                          {isRemoved
                            ? <CheckCircle2 className="h-4 w-4" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </button>
                      </div>

                      <p className="text-sm font-medium text-[#1C1208]">{q.stem}</p>

                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={cn(
                              "rounded-lg px-3 py-2 text-xs border",
                              opt === q.answer
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-medium"
                                : "border-slate-100 bg-stone-50 text-stone-600"
                            )}
                          >
                            <span className="font-bold mr-1">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                            {opt === q.answer && (
                              <span className="ml-1 text-emerald-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-xs text-stone-500 italic border-t border-slate-100 pt-2">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  onClick={save}
                  disabled={activeCount === 0 || phase === "saving"}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {phase === "saving"
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saqlanmoqda...</>
                    : <><Save className="h-4 w-4 mr-2" /> {activeCount} ta savolni saqlash</>
                  }
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={phase === "saving"}>
                  Bekor qilish
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
