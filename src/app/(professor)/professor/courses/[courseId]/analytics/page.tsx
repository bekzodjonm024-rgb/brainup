import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft, Users, TrendingUp, AlertTriangle,
  HelpCircle, CheckCircle2, Clock, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

function masteryColor(score: number) {
  if (score >= 0.85) return "bg-emerald-500";
  if (score >= 0.65) return "bg-blue-400";
  if (score >= 0.50) return "bg-amber-400";
  return "bg-red-400";
}

function masteryBg(score: number) {
  if (score >= 0.85) return "bg-emerald-100 text-emerald-700";
  if (score >= 0.65) return "bg-blue-100 text-blue-700";
  if (score >= 0.50) return "bg-amber-100 text-amber-700";
  if (score > 0) return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-400";
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

  // Per-topic stats
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

  // Per-student stats (across all topics)
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

  // Hard questions (lowest correct rate, min 3 attempts)
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

  // Summary counts
  const totalStudents = course.enrollments.length;
  const activeStudents = studentStats.filter((s) => s.attempts > 0).length;
  const masteredStudents = studentStats.filter((s) => s.topicsMastered > 0).length;
  const avgMastery = topicStats.length
    ? topicStats.filter((t) => t.tried > 0).reduce((s, t) => s + t.avg, 0) /
      Math.max(1, topicStats.filter((t) => t.tried > 0).length)
    : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={`${course.title} — Analitika`} description="Kurs bo'yicha batafsil tahlil" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <Link href={`/professor/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Kursga qaytish
            </Button>
          </Link>
          <Link href="/professor/analytics">
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" /> Umumiy analitika
            </Button>
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="h-4 w-4 text-blue-600" />, label: "Jami talabalar", value: totalStudents, bg: "bg-blue-50" },
            { icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: "Faol talabalar", value: activeStudents, bg: "bg-emerald-50" },
            { icon: <CheckCircle2 className="h-4 w-4 text-violet-600" />, label: "O'zlashtirildi", value: masteredStudents, bg: "bg-violet-50" },
            { icon: <AlertTriangle className="h-4 w-4 text-amber-600" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, bg: "bg-amber-50" },
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

        {/* Topic performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Mavzular bo'yicha natijalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 w-8">#</th>
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500">Mavzu</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Uringanlar</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">O'rtacha mastery</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">O'zlashtirildi</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">O'rt. urinish</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Savollar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topicStats.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-slate-800 font-medium line-clamp-1">{t.title}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-slate-600">{t.tried}/{t.total}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(
                            "text-xs font-semibold rounded-full px-2 py-0.5",
                            masteryBg(t.avg)
                          )}>
                            {t.tried > 0 ? `${Math.round(t.avg * 100)}%` : "—"}
                          </span>
                          {t.tried > 0 && <Progress value={t.avg * 100} className="h-1 w-16" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{t.masteredCount}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">
                        {t.avgAttempts > 0 ? t.avgAttempts.toFixed(1) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <Badge variant={t.questions > 0 ? "secondary" : "outline"} className="text-xs">
                          {t.questions}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Student progress table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              Talabalar progressi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentStats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Talabalar hali yozilmagan</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500">Talaba</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">O'rtacha mastery</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Boshladi</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">O'zlashtirildi</th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Urinishlar</th>
                      <th className="text-right py-2 pl-2 text-xs font-medium text-slate-500">Oxirgi faollik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentStats.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-slate-800">
                            {s.firstName} {s.lastName}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "text-xs font-semibold rounded-full px-2 py-0.5",
                              masteryBg(s.avgMastery)
                            )}>
                              {s.topicsStarted > 0 ? `${Math.round(s.avgMastery * 100)}%` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          {s.topicsStarted}/{course.topics.length}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {s.topicsMastered > 0 ? (
                            <span className="text-emerald-600 font-medium">{s.topicsMastered}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500">{s.attempts}</td>
                        <td className="py-2.5 pl-2 text-right text-xs text-slate-400">
                          <span className={cn(
                            s.lastActive && (Date.now() - s.lastActive.getTime()) > 7 * 24 * 60 * 60 * 1000
                              ? "text-amber-500"
                              : "text-slate-400"
                          )}>
                            {timeAgo(s.lastActive)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hard questions */}
        {questionStats.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-red-400" />
                Eng qiyin savollar
                <Badge variant="destructive" className="text-xs ml-1">{questionStats.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questionStats.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 line-clamp-2">{q.stem}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{q.topicTitle} • {q.total} ta urinish</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold text-red-600">
                        {Math.round((q.rate ?? 0) * 100)}%
                      </span>
                      <p className="text-xs text-slate-400">to'g'ri</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
