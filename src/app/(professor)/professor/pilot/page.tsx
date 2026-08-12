import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AssignIdsButton } from "./assign-ids-button";
import { ExportButton } from "./export-button";
import {
  Users, Brain, Zap, CheckCircle2,
  Activity, TrendingUp, Clock, FlaskConical
} from "lucide-react";

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
      <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
        <Header title="Pilot monitoring" description="Tadqiqot va pilot nazorat paneli" />
        <main className="flex-1 p-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3">
              <FlaskConical className="h-6 w-6 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-slate-500">Kurslar yo&apos;q — avval kurs yarating</p>
          </div>
        </main>
      </div>
    );
  }

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
    db.cognitiveProfile.count({ where: { studentId: { in: studentIds } } }),
    db.attempt.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _count: { studentId: true },
    }).then((r) => r.length),
    db.learnerKnowledge.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, masteryScore: { gte: 0.85 } },
    }).then((r) => r.length),
    db.learningEvent.count({
      where: { studentId: { in: studentIds }, createdAt: { gte: today } },
    }),
    db.learningEvent.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, createdAt: { gte: today } },
    }).then((r) => r.length),
    db.attempt.count({ where: { studentId: { in: studentIds } } }),
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
    db.learningEvent.groupBy({
      by: ["eventType"],
      where: {
        studentId: { in: studentIds },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _count: { eventType: true },
      orderBy: { _count: { eventType: "desc" } },
    }),
    db.intervention.groupBy({
      by: ["action"],
      where: { studentId: { in: studentIds } },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
  ]);

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
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title="Pilot Monitoring" description="NamDPI tadqiqot va pilot nazorat paneli" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl">

        {/* Research ID alert */}
        {withoutResearchId > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FlaskConical className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-300">
                  {withoutResearchId} ta talabada tadqiqot ID&apos;si yo&apos;q
                </p>
                <p className="text-xs text-amber-500 mt-0.5">
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
            { icon: <Users className="h-5 w-5 text-blue-400" />, label: "Jami talabalar", value: totalEnrolled, border: "border-blue-500/20", glow: "bg-blue-500/5", iconBg: "bg-blue-500/10" },
            { icon: <Activity className="h-5 w-5 text-emerald-400" />, label: "Bugun faol", value: activeStudentsToday, border: "border-emerald-500/20", glow: "bg-emerald-500/5", iconBg: "bg-emerald-500/10" },
            { icon: <Zap className="h-5 w-5 text-amber-400" />, label: "Bugun eventlar", value: todayEventCount, border: "border-amber-500/20", glow: "bg-amber-500/5", iconBg: "bg-amber-500/10" },
            { icon: <TrendingUp className="h-5 w-5 text-violet-400" />, label: "Jami urinishlar", value: totalAttempts.toLocaleString(), border: "border-violet-500/20", glow: "bg-violet-500/5", iconBg: "bg-violet-500/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.glow} p-5`}>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="f-syne text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Engagement funnel */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-slate-500" />
                O&apos;quv funnel
              </h3>
              <div className="space-y-3">
                {funnelSteps.map((step) => (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{step.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {step.count} ta
                        <span className="text-slate-400 dark:text-slate-600 font-normal ml-1">({step.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${step.color}`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity log */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-slate-500" />
                So&apos;nggi faollik (anonim)
              </h3>
              {recentEvents.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-6">Hali hech qanday event yo&apos;q</p>
              ) : (
                <div className="space-y-1">
                  {recentEvents.map((ev) => {
                    const rid = ev.student.researchId ?? `ANON-${ev.studentId.slice(0, 6)}`;
                    return (
                      <div key={ev.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800/60 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 shrink-0">
                            {rid}
                          </code>
                          <span className="text-xs text-slate-500 truncate">
                            {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                            {ev.topicId && topicTitles.get(ev.topicId) && (
                              <span className="text-slate-400 dark:text-slate-600 ml-1">— {topicTitles.get(ev.topicId)}</span>
                            )}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0 ml-2">
                          {timeAgo(ev.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Event distribution */}
            {eventTypeCounts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-slate-500" />
                  7 kunlik eventlar
                </h3>
                <div className="space-y-2">
                  {eventTypeCounts.slice(0, 8).map((e) => (
                    <div key={e.eventType} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate">{EVENT_LABELS[e.eventType] ?? e.eventType}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300 ml-2 shrink-0">{e._count.eventType}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intervention distribution */}
            {interventionCounts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-slate-500" />
                  Adaptiv tavsiyalar
                </h3>
                <div className="space-y-2">
                  {interventionCounts.map((iv) => (
                    <div key={iv.action} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{ACTION_LABELS[iv.action] ?? iv.action}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{iv._count.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
                Ma&apos;lumotlarni eksport qilish
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-600 mb-3">
                Barcha ma&apos;lumotlar anonim (researchId) bilan CSV formatida yuklanadi.
              </p>
              <div className="space-y-2">
                {[
                  { type: "events", label: "O'quv eventlar" },
                  { type: "mastery", label: "Mastery holati" },
                  { type: "attempts", label: "Savollar urinishlari" },
                  { type: "interventions", label: "Adaptiv aralashuvlar" },
                ].map((ex) => (
                  <ExportButton key={ex.type} type={ex.type} label={ex.label} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Per-course breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Brain className="h-4 w-4 text-slate-500" />
              Kurslar bo&apos;yicha taqsimot
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left py-2.5 pr-4 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kurs</th>
                  <th className="text-center py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Yozilgan</th>
                  <th className="text-center py-2.5 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Eksport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">{c.title}</td>
                    <td className="py-2.5 px-2 text-center text-slate-500">{c._count.enrollments}</td>
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
        </div>
      </main>
    </div>
  );
}
