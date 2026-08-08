import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssignIdsButton } from "./assign-ids-button";
import { ExportButton } from "./export-button";
import {
  Users, Brain, Zap, CheckCircle2, Download,
  Activity, TrendingUp, Clock, FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_LABELS: Record<string, string> = {
  LESSON_STARTED: "Dars boshlandi",
  LESSON_COMPLETED: "Dars yakunlandi",
  QUESTION_ANSWERED: "Savol javoblandi",
  PRACTICE_COMPLETED: "Mashq yakunlandi",
  RETRIEVAL_STARTED: "Takrorlash boshlandi",
  RETRIEVAL_COMPLETED: "Takrorlash yakunlandi",
  TOPIC_MASTERED: "Mavzu o'zlashtirildi",
  ASSESSMENT_STARTED: "Baholash boshlandi",
  ASSESSMENT_COMPLETED: "Baholash yakunlandi",
};

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Hozir";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default async function PilotPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");
  const professorId = session.user.profileId;

  const courses = await db.course.findMany({
    where: { professorId, isActive: true },
    select: { id: true, title: true, _count: { select: { enrollments: true } } },
  });
  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <Header title="Pilot monitoring" description="Tadqiqot va pilot nazorat paneli" />
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="mx-auto h-10 w-10 text-slate-200 mb-3" />
              <p className="text-slate-500">Kurslar yo'q — avval kurs yarating</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // All enrolled student IDs
  const enrollments = await db.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: { student: { select: { id: true, researchId: true } } },
  });

  const uniqueStudents = new Map(enrollments.map((e) => [e.student.id, e.student]));
  const studentIds = Array.from(uniqueStudents.keys());
  const totalEnrolled = studentIds.length;
  const withoutResearchId = Array.from(uniqueStudents.values()).filter((s) => !s.researchId).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // All counts in parallel
  const [
    assessedCount,
    practicedCount,
    masteredCount,
    todayEventCount,
    activeStudentsToday,
    totalAttempts,
    recentEvents,
    eventTypeCounts,
    interventionCounts,
  ] = await Promise.all([
    // Completed cognitive assessment
    db.cognitiveProfile.count({ where: { studentId: { in: studentIds } } }),

    // Started at least 1 practice (has attempts)
    db.attempt.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _count: { studentId: true },
    }).then((r) => r.length),

    // Mastered at least 1 topic (masteryScore >= 0.85)
    db.learnerKnowledge.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, masteryScore: { gte: 0.85 } },
    }).then((r) => r.length),

    // Today's events
    db.learningEvent.count({
      where: { studentId: { in: studentIds }, createdAt: { gte: today } },
    }),

    // Active students today
    db.learningEvent.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, createdAt: { gte: today } },
    }).then((r) => r.length),

    // Total attempts
    db.attempt.count({ where: { studentId: { in: studentIds } } }),

    // Recent 25 events (anonymized)
    db.learningEvent.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true, eventType: true, topicId: true,
        createdAt: true, studentId: true,
        student: { select: { researchId: true } },
      },
    }),

    // Event type distribution (last 7 days)
    db.learningEvent.groupBy({
      by: ["eventType"],
      where: {
        studentId: { in: studentIds },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _count: { eventType: true },
      orderBy: { _count: { eventType: "desc" } },
    }),

    // Intervention distribution
    db.intervention.groupBy({
      by: ["action"],
      where: { studentId: { in: studentIds } },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
  ]);

  // Funnel percentages
  // Build topic title map for recent events
  const topicIdsInEvents = [...new Set(recentEvents.map((e) => e.topicId).filter(Boolean))] as string[];
  const topicTitles = topicIdsInEvents.length
    ? await db.topic.findMany({
        where: { id: { in: topicIdsInEvents } },
        select: { id: true, title: true },
      }).then((ts) => new Map(ts.map((t) => [t.id, t.title])))
    : new Map<string, string>();

  const funnelSteps = [
    { label: "Yozilgan", count: totalEnrolled, pct: 100, color: "bg-blue-500" },
    { label: "Baholangan", count: assessedCount, pct: totalEnrolled ? Math.round((assessedCount / totalEnrolled) * 100) : 0, color: "bg-violet-500" },
    { label: "Mashq qilgan", count: practicedCount, pct: totalEnrolled ? Math.round((practicedCount / totalEnrolled) * 100) : 0, color: "bg-amber-500" },
    { label: "O'zlashtirildi ≥1", count: masteredCount, pct: totalEnrolled ? Math.round((masteredCount / totalEnrolled) * 100) : 0, color: "bg-emerald-500" },
  ];

  const ACTION_LABELS: Record<string, string> = {
    PRACTICE: "Mashq", EXPLAIN_AGAIN: "Qayta o'qish",
    PREREQUISITE: "Oldingi mavzu", CONTINUE: "Davom etish",
    RETRIEVE: "Takrorlash", ADVANCED_PRACTICE: "Murakkab",
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Pilot Monitoring" description="NDPI tadqiqot va pilot nazorat paneli" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl">

        {/* Research ID status */}
        {withoutResearchId > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FlaskConical className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {withoutResearchId} ta talabada tadqiqot ID'si yo'q
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Eksport qilishdan oldin barcha talabalarni P-XXXX formatida anonim ID bilan belgilang.
                </p>
              </div>
            </div>
            <AssignIdsButton />
          </div>
        )}

        {/* Live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="h-4 w-4 text-blue-600" />, label: "Jami talabalar", value: totalEnrolled, bg: "bg-blue-50" },
            { icon: <Activity className="h-4 w-4 text-emerald-600" />, label: "Bugun faol", value: activeStudentsToday, bg: "bg-emerald-50" },
            { icon: <Zap className="h-4 w-4 text-amber-600" />, label: "Bugun eventlar", value: todayEventCount, bg: "bg-amber-50" },
            { icon: <TrendingUp className="h-4 w-4 text-violet-600" />, label: "Jami urinishlar", value: totalAttempts.toLocaleString(), bg: "bg-violet-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("rounded-lg p-1.5", s.bg)}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Engagement funnel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  O'quv funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {funnelSteps.map((step) => (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{step.label}</span>
                      <span className="font-semibold text-slate-800">
                        {step.count} ta
                        <span className="text-slate-400 font-normal ml-1">({step.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", step.color)} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent activity log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  So'nggi faollik (anonim)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Hali hech qanday event yo'q</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentEvents.map((ev) => {
                      const rid = ev.student.researchId ?? `ANON-${ev.studentId.slice(0, 6)}`;
                      return (
                        <div key={ev.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0">
                              {rid}
                            </code>
                            <span className="text-xs text-slate-700 truncate">
                              {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                              {ev.topicId && topicTitles.get(ev.topicId) && (
                                <span className="text-slate-400 ml-1">— {topicTitles.get(ev.topicId)}</span>
                              )}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 ml-2">
                            {timeAgo(ev.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Event distribution */}
            {eventTypeCounts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-400" />
                    7 kunlik eventlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {eventTypeCounts.slice(0, 8).map((e) => (
                    <div key={e.eventType} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate">{EVENT_LABELS[e.eventType] ?? e.eventType}</span>
                      <span className="font-semibold text-slate-800 ml-2 shrink-0">{e._count.eventType}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Intervention distribution */}
            {interventionCounts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-slate-400" />
                    Adaptiv tavsiyalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interventionCounts.map((iv) => (
                    <div key={iv.action} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{ACTION_LABELS[iv.action] ?? iv.action}</span>
                      <span className="font-semibold text-slate-800">{iv._count.action}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Export */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Download className="h-4 w-4 text-slate-400" />
                  Ma'lumotlarni eksport qilish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  Barcha ma'lumotlar anonim (researchId) bilan CSV formatida yuklanadi.
                </p>
                {[
                  { type: "events", label: "O'quv eventlar" },
                  { type: "mastery", label: "Mastery holati" },
                  { type: "attempts", label: "Savollar urinishlari" },
                  { type: "interventions", label: "Adaptiv aralashuvlar" },
                ].map((ex) => (
                  <ExportButton key={ex.type} type={ex.type} label={ex.label} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Per-course breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-slate-500" />
              Kurslar bo'yicha taqsimot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500">Kurs</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Yozilgan</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Eksport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-800">{c.title}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{c._count.enrollments}</td>
                      <td className="py-2.5 px-2 text-center">
                        <ExportButton
                          type="mastery"
                          label="Mastery"
                          courseId={c.id}
                          size="xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
