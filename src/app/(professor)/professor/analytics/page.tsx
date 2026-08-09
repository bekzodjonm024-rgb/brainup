import type { Metadata } from "next";
export const metadata: Metadata = { title: "Tahlil" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users, TrendingUp, AlertTriangle, ArrowRight,
  BarChart3, BookOpen, Zap, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

function masteryLevel(score: number) {
  if (score >= 0.85) return { label: "O'zlashtirildi", color: "text-emerald-700 bg-emerald-100" };
  if (score >= 0.50) return { label: "Jarayonda", color: "text-blue-700 bg-blue-100" };
  return { label: "Qiyin", color: "text-red-700 bg-red-100" };
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

  // Aggregate all knowledge records
  const allKnowledge = courses.flatMap((c) =>
    c.topics.flatMap((t) => t.learnerKnowledge)
  );

  const mastered = allKnowledge.filter((k) => k.masteryScore >= 0.85).length;
  const onTrack = allKnowledge.filter((k) => k.masteryScore >= 0.5 && k.masteryScore < 0.85).length;
  const struggling = allKnowledge.filter((k) => k.masteryScore < 0.5 && k.attempts > 0).length;
  const notStarted = allKnowledge.filter((k) => k.attempts === 0).length;

  const totalStudents = new Set(
    await db.enrollment.findMany({
      where: { course: { professorId } },
      select: { studentId: true },
    }).then((e) => e.map((x) => x.studentId))
  ).size;

  const totalAttempts = allKnowledge.reduce((s, k) => s + k.attempts, 0);

  // Difficult topics across all courses
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

  // Intervention stats
  const interventionCounts = await db.intervention.groupBy({
    by: ["action"],
    where: { topic: { course: { professorId } } },
    _count: { action: true },
    orderBy: { _count: { action: "desc" } },
  });

  // Course-level summary
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Analitika" description="Barcha kurslar bo'yicha o'quv tahlili" />

      <main className="flex-1 p-6 space-y-6 max-w-5xl">

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users className="h-4 w-4 text-blue-600" />, label: "Jami talabalar", value: totalStudents, bg: "bg-blue-50" },
            { icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: "Jami urinishlar", value: totalAttempts.toLocaleString(), bg: "bg-emerald-50" },
            { icon: <CheckCircle2 className="h-4 w-4 text-violet-600" />, label: "O'zlashtirildi", value: mastered, bg: "bg-violet-50" },
            { icon: <AlertTriangle className="h-4 w-4 text-amber-600" />, label: "Qiynalyapti", value: struggling, bg: "bg-amber-50" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("rounded-lg p-1.5", s.bg)}>{s.icon}</div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Mastery distribution */}
            {total > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    O'zlashtirish taqsimoti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "O'zlashtirildi (≥85%)", count: mastered, color: "bg-emerald-500", pct: Math.round((mastered / total) * 100) },
                    { label: "Jarayonda (50–84%)", count: onTrack, color: "bg-blue-500", pct: Math.round((onTrack / total) * 100) },
                    { label: "Qiyin (<50%)", count: struggling, color: "bg-red-400", pct: Math.round((struggling / total) * 100) },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{row.label}</span>
                        <span className="font-semibold text-slate-800">
                          {row.count} ta ({row.pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", row.color)} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Course summaries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Kurslar bo'yicha natijalar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseSummaries.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Kurslar yo'q</p>
                ) : (
                  courseSummaries.map((c) => (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 truncate">{c.title}</span>
                            <Badge variant="secondary" className="text-xs shrink-0">{c.students} talaba</Badge>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                            <span>{c.topics} mavzu</span>
                            <span>O'rtacha: {Math.round(c.avgMastery * 100)}%</span>
                            <span>{c.masteredCount} ta o'zlashtirildi</span>
                          </div>
                        </div>
                        <Link href={`/professor/courses/${c.id}/analytics`}>
                          <Button variant="outline" size="sm">
                            Batafsil <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                      <Progress value={c.avgMastery * 100} className="h-1.5" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Difficult topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Qiyin mavzular
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {difficultTopics.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300 mb-1" />
                    <p className="text-xs text-slate-400">Barcha mavzular yaxshi</p>
                  </div>
                ) : (
                  difficultTopics.map((t) => (
                    <div key={t.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700 truncate flex-1 mr-2 line-clamp-1">{t.title}</span>
                        <span className={cn(
                          "text-xs font-semibold rounded-full px-2 py-0.5 shrink-0",
                          masteryLevel(t.avg ?? 0).color
                        )}>
                          {Math.round((t.avg ?? 0) * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{t.courseName} • {t.tried} talaba</p>
                      <Progress value={(t.avg ?? 0) * 100} className="h-1" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Adaptive interventions */}
            {interventionCounts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Adaptiv tavsiyalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interventionCounts.map((iv) => (
                    <div key={iv.action} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{ACTION_LABELS[iv.action] ?? iv.action}</span>
                      <span className="font-semibold text-slate-800">{iv._count.action}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
