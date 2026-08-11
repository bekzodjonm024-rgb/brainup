import type { Metadata } from "next";
export const metadata: Metadata = { title: "Progressim" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { formatDate } from "@/lib/utils";
import { TrendingUp, BookOpen, Zap, RefreshCw, Brain, CheckCircle2, Clock } from "lucide-react";

function masteryBadge(score: number | null) {
  if (score === null) return "text-slate-500 bg-slate-800 border border-slate-700";
  if (score >= 0.85) return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
  if (score >= 0.6) return "text-blue-400 bg-blue-500/10 border border-blue-500/20";
  if (score >= 0.3) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
  return "text-red-400 bg-red-500/10 border border-red-500/20";
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
    <div className="flex flex-col flex-1 overflow-auto bg-slate-950">
      <Header
        title="Progressim"
        description={`${student.firstName} ${student.lastName} — o'quv ko'rsatkichlari`}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <TrendingUp className="h-5 w-5 text-emerald-400" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, border: "border-emerald-500/20", glow: "bg-emerald-500/5", iconBg: "bg-emerald-500/10" },
            { icon: <CheckCircle2 className="h-5 w-5 text-blue-400" />, label: "O'zlashtirilgan", value: `${masteredTopics} / ${allKnowledge.length}`, border: "border-blue-500/20", glow: "bg-blue-500/5", iconBg: "bg-blue-500/10" },
            { icon: <Zap className="h-5 w-5 text-amber-400" />, label: "Aniqlik", value: totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—", border: "border-amber-500/20", glow: "bg-amber-500/5", iconBg: "bg-amber-500/10" },
            { icon: <RefreshCw className="h-5 w-5 text-violet-400" />, label: "Takrorlash", value: `${retrievalDone} bajarildi`, border: "border-violet-500/20", glow: "bg-violet-500/5", iconBg: "bg-violet-500/10", sub: retrievalPending > 0 ? `${retrievalPending} muddati o'tgan` : undefined },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.glow} p-5`}>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>{s.icon}</div>
              <p className="f-syne text-2xl font-bold text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
              {"sub" in s && s.sub && <p className="text-xs text-amber-400 mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {student.enrollments.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 py-12 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Hali kurslarga yozilmadingiz</p>
              </div>
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
                  <div key={enrollment.course.id} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                    <div className="p-5 border-b border-slate-800">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-200">{enrollment.course.title}</h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {mastered}/{topics.length} mavzu · O&apos;rtacha {Math.round(courseMastery * 100)}%
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${masteryBadge(started > 0 ? courseMastery : null)}`}>
                          {masteryLabel(started > 0 ? courseMastery : null)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${topics.length > 0 ? (mastered / topics.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                      {topics.map((topic) => {
                        const k = topic.learnerKnowledge[0];
                        const score = k?.masteryScore ?? null;
                        return (
                          <div
                            key={topic.id}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-slate-800/30 transition-colors"
                          >
                            <span className="text-slate-700 text-xs w-5 text-right shrink-0">
                              {topic.orderIndex + 1}
                            </span>
                            <span className="flex-1 text-slate-400 truncate">{topic.title}</span>
                            {k && (
                              <>
                                <span className="text-xs text-slate-600 shrink-0 hidden sm:block">
                                  {k.attempts} urinish
                                </span>
                                {k.lastPracticedAt && (
                                  <span className="text-xs text-slate-600 shrink-0 hidden md:block">
                                    {formatDate(k.lastPracticedAt)}
                                  </span>
                                )}
                              </>
                            )}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${masteryBadge(score)}`}>
                              {score !== null ? `${Math.round(score * 100)}%` : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Practice stats */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-amber-400" />
                Amaliyot statistikasi
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Jami savollar", value: totalAttempts },
                  { label: "To'g'ri javoblar", value: correctAttempts },
                  { label: "Aniqlik", value: totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—" },
                  { label: "Takrorlash bajarildi", value: retrievalDone },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-200">{row.value}</span>
                  </div>
                ))}
                {retrievalPending > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {retrievalPending} ta takrorlash muddati o&apos;tgan
                  </div>
                )}
              </div>
            </div>

            {/* Cognitive profile */}
            {student.cognitiveProfile ? (
              <CognitiveProfileCard
                attentionScore={student.cognitiveProfile.attentionScore}
                workingMemoryScore={student.cognitiveProfile.workingMemoryScore}
                processingSpeedScore={student.cognitiveProfile.processingSpeedScore}
                memoryScore={student.cognitiveProfile.memoryScore}
              />
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">Kognitiv baholash bajarilmagan</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
