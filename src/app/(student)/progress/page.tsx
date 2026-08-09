import type { Metadata } from "next";
export const metadata: Metadata = { title: "Progressim" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { formatDate } from "@/lib/utils";
import { TrendingUp, BookOpen, Zap, RefreshCw, Brain, CheckCircle2, Clock } from "lucide-react";

function masteryColor(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-400";
  if (score >= 0.85) return "bg-emerald-100 text-emerald-700";
  if (score >= 0.6) return "bg-blue-100 text-blue-700";
  if (score >= 0.3) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function masteryLabel(score: number | null) {
  if (score === null) return "Boshlanmagan";
  if (score >= 0.85) return "O'zlashtirildi";
  if (score >= 0.6) return "Yaxshi";
  if (score >= 0.3) return "O'rta";
  return "Boshlang'ich";
}

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      cognitiveProfile: true,
      enrollments: {
        include: {
          course: {
            include: {
              topics: {
                include: {
                  learnerKnowledge: {
                    where: { studentId },
                    take: 1,
                  },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
        orderBy: { enrolledAt: "asc" },
      },
      retrievalRecords: {
        select: { status: true, dueAt: true },
      },
    },
  });

  if (!student) redirect("/login");

  const allKnowledge = student.enrollments.flatMap((e) =>
    e.course.topics.flatMap((t) => t.learnerKnowledge)
  );
  const avgMastery = allKnowledge.length
    ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
    : 0;
  const masteredTopics = allKnowledge.filter((k) => k.masteryScore >= 0.85).length;

  const totalAttempts = await db.attempt.count({ where: { studentId } });
  const correctAttempts = await db.attempt.count({ where: { studentId, isCorrect: true } });
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  const retrievalDone = student.retrievalRecords.filter((r) => r.status === "COMPLETED").length;
  const retrievalPending = student.retrievalRecords.filter(
    (r) => r.status === "PENDING" && new Date(r.dueAt) <= new Date()
  ).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Progressim"
        description={`${student.firstName} ${student.lastName} — o'quv ko'rsatkichlari`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            label="O'rtacha mastery"
            value={`${Math.round(avgMastery * 100)}%`}
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
            label="O'zlashtirilgan"
            value={`${masteredTopics} / ${allKnowledge.length}`}
            bg="bg-blue-50"
          />
          <StatCard
            icon={<Zap className="h-5 w-5 text-amber-600" />}
            label="Aniqlik"
            value={totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—"}
            bg="bg-amber-50"
          />
          <StatCard
            icon={<RefreshCw className="h-5 w-5 text-violet-600" />}
            label="Takrorlash"
            value={`${retrievalDone} bajarildi`}
            bg="bg-violet-50"
            sub={retrievalPending > 0 ? `${retrievalPending} muddati o'tgan` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Per-course progress */}
            {student.enrollments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">Hali kurslarga yozilmadingiz</p>
                </CardContent>
              </Card>
            ) : (
              student.enrollments.map((enrollment) => {
                const topics = enrollment.course.topics;
                const started = topics.filter((t) => t.learnerKnowledge.length > 0).length;
                const mastered = topics.filter(
                  (t) => (t.learnerKnowledge[0]?.masteryScore ?? 0) >= 0.85
                ).length;
                const courseMastery =
                  started > 0
                    ? topics
                        .filter((t) => t.learnerKnowledge.length > 0)
                        .reduce((s, t) => s + (t.learnerKnowledge[0]?.masteryScore ?? 0), 0) /
                      started
                    : 0;

                return (
                  <Card key={enrollment.course.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base">{enrollment.course.title}</CardTitle>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {mastered}/{topics.length} mavzu · O&apos;rtacha {Math.round(courseMastery * 100)}%
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs shrink-0 ${masteryColor(courseMastery > 0 ? courseMastery : null)}`}
                        >
                          {masteryLabel(started > 0 ? courseMastery : null)}
                        </Badge>
                      </div>
                      <Progress
                        value={topics.length > 0 ? (mastered / topics.length) * 100 : 0}
                        className="h-1.5 mt-2"
                      />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1.5">
                        {topics.map((topic) => {
                          const k = topic.learnerKnowledge[0];
                          const mastery = k?.masteryScore ?? null;
                          return (
                            <div
                              key={topic.id}
                              className="flex items-center gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0"
                            >
                              <span className="text-slate-400 text-xs w-5 text-right shrink-0">
                                {topic.orderIndex + 1}
                              </span>
                              <span className="flex-1 text-slate-700 truncate">{topic.title}</span>
                              {k && (
                                <>
                                  <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                                    {k.attempts} urinish
                                  </span>
                                  {k.lastPracticedAt && (
                                    <span className="text-xs text-slate-400 shrink-0 hidden md:block">
                                      {formatDate(k.lastPracticedAt)}
                                    </span>
                                  )}
                                </>
                              )}
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${masteryColor(mastery)}`}
                              >
                                {mastery !== null ? `${Math.round(mastery * 100)}%` : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Practice stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Amaliyot statistikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatRow label="Jami savollar" value={totalAttempts} />
                <StatRow label="To'g'ri javoblar" value={correctAttempts} />
                <StatRow
                  label="Aniqlik"
                  value={totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—"}
                />
                <StatRow label="Takrorlash bajarildi" value={retrievalDone} />
                {retrievalPending > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {retrievalPending} ta takrorlash muddati o&apos;tgan
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cognitive profile */}
            {student.cognitiveProfile ? (
              <CognitiveProfileCard
                attentionScore={student.cognitiveProfile.attentionScore}
                workingMemoryScore={student.cognitiveProfile.workingMemoryScore}
                processingSpeedScore={student.cognitiveProfile.processingSpeedScore}
                memoryScore={student.cognitiveProfile.memoryScore}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <Brain className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">Kognitiv baholash bajarilmagan</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon, label, value, bg, sub,
}: {
  icon: React.ReactNode; label: string; value: string | number; bg: string; sub?: string;
}) {
  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
          {sub && <p className="text-xs text-orange-500 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
