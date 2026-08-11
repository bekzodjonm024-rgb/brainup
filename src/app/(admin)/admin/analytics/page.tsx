import type { Metadata } from "next";
export const metadata: Metadata = { title: "Statistika" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

  // Bucket masteryScore values — groupBy returns one row per unique Float value
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Statistika" description="Platforma bo'yicha umumiy tahlil" />
      <main className="flex-1 p-6 space-y-6">

        {/* Registration trend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Jami talabalar</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">So'nggi 30 kun</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">+{newStudents30d}</p>
              <p className="text-xs text-slate-400 mt-0.5">yangi talaba</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">So'nggi 7 kun</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">+{newStudents7d}</p>
              <p className="text-xs text-slate-400 mt-0.5">yangi talaba</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mastery distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Mastery taqsimoti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(buckets).map(([label, count]) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{label}</span>
                    <span className="text-xs text-slate-400">{totalMastery > 0 ? Math.round((count / totalMastery) * 100) : 0}%</span>
                  </div>
                  <MiniBar value={count} max={totalMastery} color="bg-blue-500" />
                </div>
              ))}
              <p className="text-xs text-slate-400 pt-1">Jami {totalMastery} ta bilim yozuvi</p>
            </CardContent>
          </Card>

          {/* Content by status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Kontent holati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "APPROVED", label: "Tasdiqlangan", color: "bg-emerald-500" },
                { key: "PENDING_REVIEW", label: "Kutmoqda", color: "bg-amber-400" },
                { key: "DRAFT", label: "Qoralama", color: "bg-slate-300" },
                { key: "REJECTED", label: "Rad etilgan", color: "bg-red-400" },
              ].map(({ key, label, color }) => {
                const count = contentMap[key] ?? 0;
                const total = Object.values(contentMap).reduce((a, b) => a + b, 0);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{label}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                    <MiniBar value={count} max={total || 1} color={color} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top courses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Eng mashhur kurslar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCourses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 truncate max-w-[180px]">{course.title}</p>
                      <p className="text-[11px] text-slate-400">{course.professor.firstName} {course.professor.lastName}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      {course._count.enrollments} ta
                    </Badge>
                  </div>
                  <MiniBar value={course._count.enrollments} max={maxEnrollment} color="bg-violet-500" />
                </div>
              ))}
              {topCourses.length === 0 && (
                <p className="text-xs text-slate-400">Kurs topilmadi</p>
              )}
            </CardContent>
          </Card>

          {/* Activity events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Faollik turlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span>Jami: <strong className="text-slate-800">{totalEvents}</strong></span>
                <span>7 kun: <strong className="text-blue-600">+{events7d}</strong></span>
                <span>30 kun urinish: <strong className="text-emerald-600">+{attempts30d}</strong></span>
              </div>
              {eventTypes.map((e) => (
                <div key={e.eventType}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 truncate max-w-[180px]">
                      {EVENT_LABELS[e.eventType] ?? e.eventType}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{e._count.id}</span>
                  </div>
                  <MiniBar value={e._count.id} max={maxEventCount} color="bg-cyan-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
