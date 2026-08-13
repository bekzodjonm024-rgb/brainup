import type { Metadata } from "next";
export const metadata: Metadata = { title: "Statistika" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Users, TrendingUp, Zap } from "lucide-react";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Statistika" description="Platforma bo'yicha umumiy tahlil" />
      <main className="flex-1 p-6 space-y-6">

        {/* Registration trend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, label: "Jami talabalar", value: totalStudents, sub: undefined as string | undefined, iconBg: "bg-blue-50 dark:bg-blue-950/50" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "So'nggi 30 kun", value: `+${newStudents30d}`, sub: "yangi talaba", iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "So'nggi 7 kun", value: `+${newStudents7d}`, sub: "yangi talaba", iconBg: "bg-violet-50 dark:bg-violet-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
              {s.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mastery distribution */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Mastery taqsimoti</h3>
            <div className="space-y-3">
              {Object.entries(buckets).map(([label, count]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-600">{totalMastery > 0 ? Math.round((count / totalMastery) * 100) : 0}%</span>
                  </div>
                  <MiniBar value={count} max={totalMastery} color="bg-blue-500" />
                </div>
              ))}
              <p className="text-xs text-slate-400 dark:text-slate-600 pt-1">Jami {totalMastery} ta bilim yozuvi</p>
            </div>
          </div>

          {/* Content by status */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
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
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">Eng mashhur kurslar</h3>
            <div className="space-y-3">
              {topCourses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{course.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600">{course.professor.firstName} {course.professor.lastName}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2 shrink-0 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
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
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Faollik turlari</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span>Jami: <strong className="text-slate-600 dark:text-slate-300">{totalEvents}</strong></span>
              <span>7 kun: <strong className="text-blue-400">+{events7d}</strong></span>
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
      </main>
    </div>
  );
}
