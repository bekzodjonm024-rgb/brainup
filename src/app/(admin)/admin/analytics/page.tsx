import type { Metadata } from "next";
export const metadata: Metadata = { title: "Statistika" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CognitiveHistoryChart } from "@/components/shared/cognitive-history-chart";
import { Users, TrendingUp, Zap } from "lucide-react";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#1C1710] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{value}</span>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const [
    totalStudents,
    newStudents30d,
    newStudents7d,
    totalAttempts,
    attempts30d,
    totalEvents,
    events7d,
    contentByStatus,
    masteryBuckets,
    topCourses,
    eventTypes,
    allCognitiveHistory,
    cognitiveAvg,
  ] = await Promise.all([
    db.student.count(),
    db.user.count({ where: { role: "STUDENT", createdAt: { gte: thirtyDaysAgo } } }),
    db.user.count({ where: { role: "STUDENT", createdAt: { gte: sevenDaysAgo } } }),
    db.attempt.count(),
    db.attempt.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.learningEvent.count(),
    db.learningEvent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.contentItem.groupBy({ by: ["status"], _count: { id: true } }),
    db.learnerKnowledge.groupBy({
      by: ["masteryScore"],
      _count: { id: true },
    }),
    db.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
        professor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
    db.learningEvent.groupBy({ by: ["eventType"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 6 }),
    db.cognitiveHistory.findMany({
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
    db.cognitiveProfile.aggregate({
      _avg: { attentionScore: true, workingMemoryScore: true, processingSpeedScore: true, memoryScore: true },
      _count: { id: true },
    }),
  ]);

  const buckets = { "0–25%": 0, "26–50%": 0, "51–75%": 0, "76–100%": 0 };
  for (const row of masteryBuckets) {
    const v = row.masteryScore;
    if (v <= 0.25) buckets["0–25%"] += row._count.id;
    else if (v <= 0.5) buckets["26–50%"] += row._count.id;
    else if (v <= 0.75) buckets["51–75%"] += row._count.id;
    else buckets["76–100%"] += row._count.id;
  }
  const totalMastery = Object.values(buckets).reduce((a, b) => a + b, 0);

  const contentMap = Object.fromEntries(contentByStatus.map((r) => [r.status, r._count.id]));
  const maxEnrollment = Math.max(...topCourses.map((c) => c._count.enrollments), 1);
  const maxEventCount = Math.max(...eventTypes.map((e) => e._count.id), 1);

  // Haftalik o'rtacha kognitiv ko'rsatkichlar
  function weekKey(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // hafta boshi (yakshanba)
    return d.toISOString();
  }

  const weekMap = new Map<string, { sum: number[]; count: number }>();
  for (const h of allCognitiveHistory) {
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
      id: `week-${i}`,
      attentionScore: sum[0] / count,
      workingMemoryScore: sum[1] / count,
      processingSpeedScore: sum[2] / count,
      memoryScore: sum[3] / count,
      takenAt: key,
    }));

  const profileCount = cognitiveAvg._count.id;
  const avgAttention = Math.round(cognitiveAvg._avg.attentionScore ?? 0);
  const avgWM = Math.round(cognitiveAvg._avg.workingMemoryScore ?? 0);
  const avgSpeed = Math.round(cognitiveAvg._avg.processingSpeedScore ?? 0);
  const avgMemory = Math.round(cognitiveAvg._avg.memoryScore ?? 0);

  const EVENT_LABELS: Record<string, string> = {
    LESSON_STARTED: "Dars boshlandi",
    LESSON_COMPLETED: "Dars tugadi",
    QUESTION_ANSWERED: "Savol javoblandi",
    PRACTICE_COMPLETED: "Mashq tugadi",
    RETRIEVAL_STARTED: "Takrorlash boshlandi",
    RETRIEVAL_COMPLETED: "Takrorlash tugadi",
    TOPIC_MASTERED: "Mavzu o'zlashtrildi",
    ASSESSMENT_STARTED: "Baholash boshlandi",
    ASSESSMENT_COMPLETED: "Baholash tugadi",
    FEEDBACK_VIEWED: "Fikr ko'rildi",
    TOPIC_REOPENED: "Mavzu qayta ochildi",
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#100D09]">
      <Header title="Statistika" description="Platforma bo'yicha umumiy tahlil" />
      <main className="flex-1 p-6 space-y-6">

        {/* Registration trend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="h-5 w-5 text-[#B45309] dark:text-amber-400" />, label: "Jami talabalar", value: totalStudents, sub: undefined as string | undefined, iconBg: "bg-[#FEF4E7] dark:bg-amber-950/30" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "So'nggi 30 kun", value: `+${newStudents30d}`, sub: "yangi talaba", iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "So'nggi 7 kun", value: `+${newStudents7d}`, sub: "yangi talaba", iconBg: "bg-violet-50 dark:bg-violet-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C1710] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
              {s.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mastery distribution */}
          <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Mastery taqsimoti</h3>
            <div className="space-y-3">
              {Object.entries(buckets).map(([label, count]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-600">{totalMastery > 0 ? Math.round((count / totalMastery) * 100) : 0}%</span>
                  </div>
                  <MiniBar value={count} max={totalMastery} color="bg-[#B45309]" />
                </div>
              ))}
              <p className="text-xs text-slate-400 dark:text-slate-600 pt-1">Jami {totalMastery} ta bilim yozuvi</p>
            </div>
          </div>

          {/* Content by status */}
          <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Kontent holati</h3>
            <div className="space-y-3">
              {[
                { key: "APPROVED", label: "Tasdiqlangan", color: "bg-emerald-500" },
                { key: "PENDING_REVIEW", label: "Kutmoqda", color: "bg-amber-400" },
                { key: "DRAFT", label: "Qoralama", color: "bg-slate-600" },
                { key: "REJECTED", label: "Rad etilgan", color: "bg-red-500" },
              ].map(({ key, label, color }) => {
                const count = contentMap[key] ?? 0;
                const total = Object.values(contentMap).reduce((a, b) => a + b, 0);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-600">{count}</span>
                    </div>
                    <MiniBar value={count} max={total || 1} color={color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top courses */}
          <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Eng mashhur kurslar</h3>
            <div className="space-y-3">
              {topCourses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{course.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600">{course.professor.firstName} {course.professor.lastName}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2 shrink-0 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C1710] border border-slate-200 dark:border-white/10">
                      {course._count.enrollments} ta
                    </span>
                  </div>
                  <MiniBar value={course._count.enrollments} max={maxEnrollment} color="bg-violet-500" />
                </div>
              ))}
              {topCourses.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-600">Kurs topilmadi</p>
              )}
            </div>
          </div>

          {/* Activity events */}
          <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Faollik turlari</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span>Jami: <strong className="text-slate-600 dark:text-slate-300">{totalEvents}</strong></span>
              <span>7 kun: <strong className="text-amber-400">+{events7d}</strong></span>
              <span>30 kun urinish: <strong className="text-emerald-400">+{attempts30d}</strong></span>
            </div>
            <div className="space-y-3">
              {eventTypes.map((e) => (
                <div key={e.eventType}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {EVENT_LABELS[e.eventType] ?? e.eventType}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0 ml-2">{e._count.id}</span>
                  </div>
                  <MiniBar value={e._count.id} max={maxEventCount} color="bg-cyan-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cognitive dynamics */}
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#17130E] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Platformadagi kognitiv dinamika
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {allCognitiveHistory.length} ta diagnostik test — {profileCount} ta talaba profili
              </p>
            </div>
            {profileCount > 0 && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Diqqat", value: avgAttention, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" },
                  { label: "Ishchi xotira", value: avgWM, color: "text-[#B45309] bg-[#FEF4E7] dark:bg-blue-950/40 border-[#FDE8C8] dark:border-blue-800" },
                  { label: "Tezlik", value: avgSpeed, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
                  { label: "Xotira", value: avgMemory, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" },
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
