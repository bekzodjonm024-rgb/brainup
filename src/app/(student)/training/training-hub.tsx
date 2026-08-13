"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Play, CheckCircle2, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CognitiveHistoryChart } from "@/components/shared/cognitive-history-chart";

interface Exercise {
  category: string;
  difficulty: string;
  order: number;
  completed: boolean;
}

interface Plan {
  id: string;
  cycleDay: number;
  exercises: Exercise[];
  isComplete: boolean;
}

interface Profile {
  attentionScore: number | null;
  workingMemoryScore: number | null;
  processingSpeedScore: number | null;
  memoryScore: number | null;
}

interface HistoryEntry {
  id: string;
  attentionScore: number;
  workingMemoryScore: number;
  processingSpeedScore: number;
  memoryScore: number;
  takenAt: string;
}

interface Props {
  profile: Profile | null;
  nextDiagnosticAt: string | null;
  history: HistoryEntry[];
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  ATTENTION:        { label: "Diqqat",       icon: "🎯", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  WORKING_MEMORY:   { label: "Ishchi xotira", icon: "🧠", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  PROCESSING_SPEED: { label: "Tezlik",        icon: "⚡", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  MEMORY:           { label: "Xotira",        icon: "💡", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BASIC: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Murakkab",
};

export function TrainingHub({ profile, nextDiagnosticAt, history }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [status, setStatus] = useState<"loading" | "NO_PROFILE" | "DIAGNOSTIC_DUE" | "OK">("loading");

  useEffect(() => {
    fetch("/api/training/today")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status);
        if (data.plan) setPlan(data.plan);
      });
  }, []);

  const daysUntilDiagnostic = nextDiagnosticAt
    ? Math.max(0, Math.ceil((new Date(nextDiagnosticAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "NO_PROFILE") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <Brain className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Kognitiv profil yo&apos;q</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Mashqlar boshlash uchun avval diagnostik testni topshiring
        </p>
        <Button asChild>
          <Link href="/assessment">Testni boshlash</Link>
        </Button>
      </div>
    );
  }

  if (status === "DIAGNOSTIC_DUE") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Diagnostik test vaqti keldi!</h2>
        <p className="text-slate-500 mb-6 text-sm">
          10 kunlik tsikl tugadi. Yangi diagnostik test topshiring va ko&apos;rsatkichlaringiz yangilansin.
        </p>
        <Button asChild>
          <Link href="/assessment">Diagnostik testni boshlash</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tsikl holati */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tsikl kuni", value: plan ? `${plan.cycleDay}/9` : "—", icon: <Clock className="h-4 w-4" /> },
          { label: "Keyingi test", value: daysUntilDiagnostic != null ? `${daysUntilDiagnostic} kun` : "—", icon: <Brain className="h-4 w-4" /> },
          { label: "Tarix", value: `${history.length} ta test`, icon: <TrendingUp className="h-4 w-4" /> },
          { label: "Bugun", value: plan?.isComplete ? "Bajarildi ✓" : `${plan?.exercises.filter((e) => e.completed).length ?? 0}/${plan?.exercises.length ?? 0}`, icon: <CheckCircle2 className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              {s.icon}
              <span className="text-xs uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bugungi mashqlar */}
      {plan && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-4">
            Bugungi mashqlar — {plan.cycleDay === 9 ? "Tayyorlov kuni" : `Kun ${plan.cycleDay}`}
          </h2>
          <div className="space-y-3">
            {plan.exercises.map((ex) => {
              const meta = CATEGORY_META[ex.category];
              return (
                <div
                  key={ex.order}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    ex.completed ? "bg-slate-50 border-slate-200 opacity-70" : meta.bg
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <p className={`font-medium ${ex.completed ? "text-slate-500" : meta.color}`}>
                        {meta.label}
                      </p>
                      <p className="text-xs text-slate-400">{DIFFICULTY_LABEL[ex.difficulty]}</p>
                    </div>
                  </div>
                  {ex.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Button asChild size="sm">
                      <Link href={`/training/${ex.category.toLowerCase()}?planId=${plan.id}&difficulty=${ex.difficulty}`}>
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Boshlash
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {plan.isComplete && (
            <p className="mt-4 text-center text-sm text-emerald-600 font-medium">
              ✓ Bugungi barcha mashqlar bajarildi!
            </p>
          )}
        </div>
      )}

      {/* Rivojlanish grafigi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-800 mb-1">Kognitiv rivojlanish</h2>
        <p className="text-xs text-slate-400 mb-4">Har diagnostik testdagi natijalar dinamikasi</p>
        <CognitiveHistoryChart history={history} />
      </div>

      {/* Joriy profil ballari */}
      {profile && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Joriy kognitiv profil</h2>
          <div className="space-y-3">
            {[
              { key: "attentionScore", label: "Diqqat", score: profile.attentionScore, color: "bg-indigo-500" },
              { key: "workingMemoryScore", label: "Ishchi xotira", score: profile.workingMemoryScore, color: "bg-blue-500" },
              { key: "processingSpeedScore", label: "Tezlik", score: profile.processingSpeedScore, color: "bg-amber-500" },
              { key: "memoryScore", label: "Xotira", score: profile.memoryScore, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-800">{Math.round(item.score ?? 0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.score ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
