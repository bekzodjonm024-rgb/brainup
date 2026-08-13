import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle,
  HelpCircle, CheckCircle2, BarChart3
} from "lucide-react";

function masteryColor(score: number) {
  if (score >= 0.85) return "bg-emerald-500";
  if (score >= 0.65) return "bg-blue-400";
  if (score >= 0.50) return "bg-amber-400";
  return "bg-red-500";
}

function masteryBadge(score: number) {
  if (score >= 0.85) return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  if (score >= 0.65) return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
  if (score >= 0.50) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  if (score > 0) return "text-red-400 bg-red-500/10 border border-red-500/20";
  return "text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700";
}

function timeAgo(date: Date | null): string {
  if (!date) return "Hech qachon";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Bugun";
  if (days === 1) return "Kecha";
  if (days < 7) return `${days} kun oldin`;
  if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
  return `${Math.floor(days / 30)} oy oldin`;
}

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      professor: { select: { id: true, firstName: true, lastName: true } },
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          learnerKnowledge: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { questions: true } },
        },
      },
      enrollments: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!course) notFound();
  if (course.professor.id !== session.user.profileId) redirect("/professor/dashboard");

  const topicStats = course.topics.map((topic) => {
    const tried = topic.learnerKnowledge.filter((k) => k.attempts > 0);
    const avg = tried.length ? tried.reduce((s, k) => s + k.masteryScore, 0) / tried.length : 0;
    const masteredCount = tried.filter((k) => k.masteryScore >= 0.85).length;
    const totalAttempts = tried.reduce((s, k) => s + k.attempts, 0);
    return {
      id: topic.id, title: topic.title,
      tried: tried.length,
      total: course.enrollments.length,
      avg, masteredCount,
      totalAttempts,
      avgAttempts: tried.length ? totalAttempts / tried.length : 0,
      questions: topic._count.questions,
    };
  });

  const studentMap = new Map<string, {
    id: string; firstName: string; lastName: string;
    masteryScores: number[]; attempts: number; lastActive: Date | null;
  }>();

  for (const enrollment of course.enrollments) {
    studentMap.set(enrollment.student.id, {
      id: enrollment.student.id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      masteryScores: [],
      attempts: 0,
      lastActive: null,
    });
  }

  for (const topic of course.topics) {
    for (const k of topic.learnerKnowledge) {
      const s = studentMap.get(k.studentId);
      if (!s) continue;
      if (k.attempts > 0) {
        s.masteryScores.push(k.masteryScore);
        s.attempts += k.attempts;
        if (k.lastPracticedAt) {
          if (!s.lastActive || k.lastPracticedAt > s.lastActive) {
            s.lastActive = k.lastPracticedAt;
          }
        }
      }
    }
  }

  const studentStats = Array.from(studentMap.values())
    .map((s) => ({
      ...s,
      avgMastery: s.masteryScores.length
        ? s.masteryScores.reduce((a, b) => a + b, 0) / s.masteryScores.length
        : 0,
      topicsStarted: s.masteryScores.length,
      topicsMastered: s.masteryScores.filter((m) => m >= 0.85).length,
    }))
    .sort((a, b) => b.avgMastery - a.avgMastery);

  const hardQuestions = await db.question.findMany({
    where: {
      topicId: { in: course.topics.map((t) => t.id) },
      isActive: true,
    },
    include: {
      attempts: { select: { isCorrect: true } },
      topic: { select: { title: true } },
    },
  });

  const questionStats = hardQuestions
    .map((q) => {
      const total = q.attempts.length;
      const correct = q.attempts.filter((a) => a.isCorrect).length;
      const rate = total > 0 ? correct / total : null;
      return { id: q.id, stem: q.stem, topicTitle: q.topic.title, total, rate };
    })
    .filter((q) => q.total >= 3 && q.rate !== null && q.rate < 0.6)
    .sort((a, b) => (a.rate ?? 1) - (b.rate ?? 1))
    .slice(0, 8);

  const totalStudents = course.enrollments.length;
  const activeStudents = studentStats.filter((s) => s.attempts > 0).length;
  const masteredStudents = studentStats.filter((s) => s.topicsMastered > 0).length;
  const avgMastery = topicStats.length
    ? topicStats.filter((t) => t.tried > 0).reduce((s, t) => s + t.avg, 0) /
      Math.max(1, topicStats.filter((t) => t.tried > 0).length)
    : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title={`${course.title} — Analitika`} description="Kurs bo'yicha batafsil tahlil" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* Nav */}
        <div className="flex items-center gap-2">
          <Link href={`/professor/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kursga qaytish
            </Button>
          </Link>
          <Link href="/professor/analytics">
            <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <BarChart3 className="h-4 w-4 mr-1" /> Umumiy analitika
            </Button>
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, label: "Jami talabalar", value: totalStudents, iconBg: "bg-blue-50 dark:bg-blue-950/50" },
            { icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, label: "Faol talabalar", value: activeStudents, iconBg: "bg-emerald-50 dark:bg-emerald-950/50" },
            { icon: <CheckCircle2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />, label: "O'zlashtirildi", value: masteredStudents, iconBg: "bg-violet-50 dark:bg-violet-950/50" },
            { icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, iconBg: "bg-amber-50 dark:bg-amber-950/50" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Topic performance table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Mavzular bo&apos;yicha natijalar
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide">Mavzu</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden sm:table-cell">Uringanlar</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide">Mastery</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden md:table-cell">O&apos;zlashtirildi</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden md:table-cell">O&apos;rt. urinish</th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden lg:table-cell">Savollar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {topicStats.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-600 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1">{t.title}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500 hidden sm:table-cell">
                      {t.tried}/{t.total}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${masteryBadge(t.avg)}`}>
                          {t.tried > 0 ? `${Math.round(t.avg * 100)}%` : "—"}
                        </span>
                        {t.tried > 0 && (
                          <div className="h-1 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${masteryColor(t.avg)}`} style={{ width: `${t.avg * 100}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">{t.masteredCount}</td>
                    <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">
                      {t.avgAttempts > 0 ? t.avgAttempts.toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.questions > 0 ? "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" : "text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"}`}>
                        {t.questions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student progress table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              Talabalar progressi
            </h3>
          </div>
          {studentStats.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Talabalar hali yozilmagan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide">Talaba</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide">Mastery</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden sm:table-cell">Boshladi</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide">O&apos;zlashtirildi</th>
                    <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden md:table-cell">Urinishlar</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wide hidden md:table-cell">Oxirgi faollik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {studentStats.map((s) => {
                    const name = `${s.firstName} ${s.lastName}`;
                    const parts = name.trim().split(/\s+/).filter(Boolean);
                    const initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
                    const isInactive = s.lastActive && (Date.now() - s.lastActive.getTime()) > 7 * 24 * 60 * 60 * 1000;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 uppercase select-none">
                              {initials}
                            </div>
                            <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${masteryBadge(s.avgMastery)}`}>
                            {s.topicsStarted > 0 ? `${Math.round(s.avgMastery * 100)}%` : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 hidden sm:table-cell">
                          {s.topicsStarted}/{course.topics.length}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {s.topicsMastered > 0 ? (
                            <span className="text-emerald-400 font-medium">{s.topicsMastered}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600">0</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 hidden md:table-cell">{s.attempts}</td>
                        <td className="px-4 py-3 text-right text-xs hidden md:table-cell">
                          <span className={isInactive ? "text-amber-400" : "text-slate-500"}>
                            {timeAgo(s.lastActive)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Hard questions */}
        {questionStats.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-red-400" />
                Eng qiyin savollar
                <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 ml-1">
                  {questionStats.length}
                </span>
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {questionStats.map((q) => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl border border-red-500/10 bg-red-500/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{q.stem}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{q.topicTitle} • {q.total} ta urinish</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-red-400">
                      {Math.round((q.rate ?? 0) * 100)}%
                    </span>
                    <p className="text-xs text-slate-400 dark:text-slate-600">to&apos;g&apos;ri</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
