import type { Metadata } from "next";
export const metadata: Metadata = { title: "Tahlil" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { CognitiveHistoryChart } from "@/components/shared/cognitive-history-chart";
import Link from "next/link";
import {
  Users, TrendingUp, AlertTriangle, ArrowRight,
  BarChart3, BookOpen, Zap, CheckCircle2
} from "lucide-react";

function masteryLevel(score: number) {
  if (score >= 0.85) return { color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" };
  if (score >= 0.50) return { color: "text-blue-400 bg-blue-500/10 border border-blue-500/20" };
  return { color: "text-red-400 bg-red-500/10 border border-red-500/20" };
}

export default async function ProfessorAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const professorId = session.user.profileId;

  const courses = await db.course.findMany({
    where: { professorId, isActive: true },
    include: {
      _count: { select: { enrollments: true } },
      topics: {
        include: {
          learnerKnowledge: { select: { masteryScore: true, attempts: true } },
          _count: { select: { questions: true } },
        },
      },
    },
  });

  const allKnowledge = courses.flatMap((c) =>
    c.topics.flatMap((t) => t.learnerKnowledge)
  );

  const mastered = allKnowledge.filter((k) => k.masteryScore >= 0.85).length;
  const onTrack = allKnowledge.filter((k) => k.masteryScore >= 0.5 && k.masteryScore < 0.85).length;
  const struggling = allKnowledge.filter((k) => k.masteryScore < 0.5 && k.attempts > 0).length;

  const totalStudents = new Set(
    await db.enrollment.findMany({
      where: { course: { professorId } },
      select: { studentId: true },
    }).then((e) => e.map((x) => x.studentId))
  ).size;

  const totalAttempts = allKnowledge.reduce((s, k) => s + k.attempts, 0);

  const difficultTopics = courses
    .flatMap((c) =>
      c.topics.map((t) => {
        const k = t.learnerKnowledge;
        const tried = k.filter((x) => x.attempts > 0);
        const avg = tried.length
          ? tried.reduce((s, x) => s + x.masteryScore, 0) / tried.length
          : null;
        return { id: t.id, title: t.title, courseName: c.title, avg, tried: tried.length };
      })
    )
    .filter((t) => t.tried >= 2 && t.avg !== null && t.avg < 0.65)
    .sort((a, b) => (a.avg ?? 1) - (b.avg ?? 1))
    .slice(0, 8);

  const [interventionCounts, enrolledStudentIds] = await Promise.all([
    db.intervention.groupBy({
      by: ["action"],
      where: { topic: { course: { professorId } } },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
    db.enrollment.findMany({
      where: { course: { professorId } },
      select: { studentId: true },
    }).then((rows) => [...new Set(rows.map((r) => r.studentId))]),
  ]);

  const [cognitiveHistory, cognitiveProfiles] = await Promise.all([
    db.cognitiveHistory.findMany({
      where: { studentId: { in: enrolledStudentIds } },
      orderBy: { takenAt: "asc" },
      select: {
        id: true,
        attentionScore: true,
        workingMemoryScore: true,
        processingSpeedScore: true,
        memoryScore: true,
        takenAt: true,
      },
    }),
    db.cognitiveProfile.findMany({
      where: { studentId: { in: enrolledStudentIds } },
      select: { attentionScore: true, workingMemoryScore: true, processingSpeedScore: true, memoryScore: true },
    }),
  ]);

  function weekKey(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString();
  }

  const weekMap = new Map<string, { sum: number[]; count: number }>();
  for (const h of cognitiveHistory) {
    const key = weekKey(h.takenAt);
    if (!weekMap.has(key)) weekMap.set(key, { sum: [0, 0, 0, 0], count: 0 });
    const entry = weekMap.get(key)!;
    entry.sum[0] += h.attentionScore;
    entry.sum[1] += h.workingMemoryScore;
    entry.sum[2] += h.processingSpeedScore;
    entry.sum[3] += h.memoryScore;
    entry.count++;
  }

  const weeklyChartData = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { sum, count }], i) => ({
      id: `w${i}`,
      attentionScore: sum[0] / count,
      workingMemoryScore: sum[1] / count,
      processingSpeedScore: sum[2] / count,
      memoryScore: sum[3] / count,
      takenAt: key,
    }));

  const avgOf = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const cogAvg = {
    attention: avgOf(cognitiveProfiles.map((p) => p.attentionScore ?? 0)),
    workingMemory: avgOf(cognitiveProfiles.map((p) => p.workingMemoryScore ?? 0)),
    speed: avgOf(cognitiveProfiles.map((p) => p.processingSpeedScore ?? 0)),
    memory: avgOf(cognitiveProfiles.map((p) => p.memoryScore ?? 0)),
  };

  const courseSummaries = courses.map((c) => {
    const k = c.topics.flatMap((t) => t.learnerKnowledge);
    const tried = k.filter((x) => x.attempts > 0);
    const avg = tried.length ? tried.reduce((s, x) => s + x.masteryScore, 0) / tried.length : 0;
    const masteredCount = tried.filter((x) => x.masteryScore >= 0.85).length;
    return {
      id: c.id, title: c.title,
      students: c._count.enrollments,
      topics: c.topics.length,
      avgMastery: avg,
      masteredCount,
      totalKnowledge: tried.length,
    };
  });

  const ACTION_LABELS: Record<string, string> = {
    PRACTICE: "Mashq tavsiyasi",
    EXPLAIN_AGAIN: "Qayta o'qish",
    PREREQUISITE: "Oldingi mavzu",
    CONTINUE: "Davom etish",
    RETRIEVE: "Takrorlash",
    ADVANCED_PRACTICE: "Murakkab mashq",
  };

  const total = mastered + onTrack + struggling;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#f8faff] dark:bg-[#0e1117]">
      <Header title="Analitika" description="Barcha kurslar bo'yicha o'quv tahlili" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, label: "Jami talabalar", value: totalStudents, iconBg: "bg-blue-50 dark:bg-blue-950/50" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Jami urinishlar", value: totalAttempts.toLocaleString(), iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <CheckCircle2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "O'zlashtirildi", value: mastered, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
            { icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "Qiynalyapti", value: struggling, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e2840] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Mastery distribution */}
            {total > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  O'zlashtirish taqsimoti
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "O'zlashtirildi (≥85%)", count: mastered, color: "bg-emerald-500", pct: Math.round((mastered / total) * 100) },
                    { label: "Jarayonda (50–84%)", count: onTrack, color: "bg-blue-600", pct: Math.round((onTrack / total) * 100) },
                    { label: "Qiyin (<50%)", count: struggling, color: "bg-red-500", pct: Math.round((struggling / total) * 100) },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {row.count} ta ({row.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-[#1e2840] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course summaries */}
            <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-slate-500" />
                Kurslar bo'yicha natijalar
              </h3>
              <div className="space-y-4">
                {courseSummaries.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-4">Kurslar yo'q</p>
                ) : (
                  courseSummaries.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{c.title}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0">{c.students} talaba</span>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-600 mt-0.5">
                            <span>{c.topics} mavzu</span>
                            <span>O'rtacha: {Math.round(c.avgMastery * 100)}%</span>
                            <span>{c.masteredCount} ta o'zlashtirildi</span>
                          </div>
                        </div>
                        <Link href={`/professor/courses/${c.id}/analytics`}>
                          <Button variant="outline" size="sm" className="border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent text-xs shrink-0">
                            Batafsil <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                      <div className="h-1 bg-slate-200 dark:bg-[#1e2840] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.avgMastery * 100}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Difficult topics */}
            <div className="rounded-2xl border border-amber-500/20 bg-white dark:bg-[#151f35] p-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Qiyin mavzular
              </h3>
              {difficultTopics.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-500">Barcha mavzular yaxshi</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {difficultTopics.map((t) => (
                    <div key={t.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate flex-1 line-clamp-1">{t.title}</span>
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${masteryLevel(t.avg ?? 0).color}`}>
                          {Math.round((t.avg ?? 0) * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{t.courseName} • {t.tried} talaba</p>
                      <div className="h-1 bg-slate-200 dark:bg-[#1e2840] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(t.avg ?? 0) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adaptive interventions */}
            {interventionCounts.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-blue-400" />
                  Adaptiv tavsiyalar
                </h3>
                <div className="space-y-2">
                  {interventionCounts.map((iv) => (
                    <div key={iv.action} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{ACTION_LABELS[iv.action] ?? iv.action}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{iv._count.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cognitive dynamics */}
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Talabalar kognitiv dinamikasi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {cognitiveHistory.length} ta diagnostik test — {cognitiveProfiles.length} ta talaba profili
              </p>
            </div>
            {cognitiveProfiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Diqqat",        value: cogAvg.attention,    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
                  { label: "Ishchi xotira", value: cogAvg.workingMemory, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" },
                  { label: "Tezlik",        value: cogAvg.speed,         color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
                  { label: "Xotira",        value: cogAvg.memory,        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
                ].map((m) => (
                  <div key={m.label} className={`rounded-lg border px-3 py-1.5 ${m.color}`}>
                    <p className="text-[11px] font-medium opacity-70">{m.label}</p>
                    <p className="text-lg font-bold leading-tight">{m.value}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <CognitiveHistoryChart history={weeklyChartData} />
        </div>

      </main>
    </div>
  );
}
