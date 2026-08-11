import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle2, Zap, BookOpen, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

function masteryColor(score: number | null) {
  if (score === null) return "bg-slate-800 border border-slate-700 text-slate-500";
  if (score >= 0.85) return "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
  if (score >= 0.6) return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
  if (score >= 0.3) return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
  return "bg-red-500/10 border border-red-500/20 text-red-400";
}

export default async function StudentReportPage({
  params,
}: {
  params: Promise<{ courseId: string; studentId: string }>;
}) {
  const { courseId, studentId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") redirect("/login");

  const professorId = session.user.profileId;

  const course = await db.course.findFirst({
    where: { id: courseId, professorId },
    select: { id: true, title: true },
  });
  if (!course) notFound();

  const enrollment = await db.enrollment.findFirst({
    where: { studentId, courseId },
    select: { enrolledAt: true },
  });
  if (!enrollment) notFound();

  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      cognitiveProfile: true,
      user: { select: { email: true } },
    },
  });
  if (!student) notFound();

  const topics = await db.topic.findMany({
    where: { courseId },
    include: {
      learnerKnowledge: {
        where: { studentId },
        take: 1,
      },
    },
    orderBy: { orderIndex: "asc" },
  });

  const totalAttempts = await db.attempt.count({
    where: { studentId, question: { topic: { courseId } } },
  });
  const correctAttempts = await db.attempt.count({
    where: { studentId, isCorrect: true, question: { topic: { courseId } } },
  });
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
  const topicsStarted = topics.filter((t) => t.learnerKnowledge.length > 0).length;
  const topicsMastered = topics.filter(
    (t) => (t.learnerKnowledge[0]?.masteryScore ?? 0) >= 0.85
  ).length;

  const knowledgeList = topics.flatMap((t) => t.learnerKnowledge);
  const avgMastery = knowledgeList.length
    ? knowledgeList.reduce((s, k) => s + k.masteryScore, 0) / knowledgeList.length
    : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-950">
      <Header
        title={`${student.firstName} ${student.lastName}`}
        description={`${course.title} — talaba hisoboti`}
      />

      <main className="flex-1 p-6 space-y-6">
        <Link href={`/professor/courses/${courseId}/students`}>
          <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" /> Talabalar ro&apos;yxati
          </button>
        </Link>

        {/* Student info */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-200">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-slate-500">{student.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {student.yearLevel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">{student.yearLevel}-kurs</span>
            )}
            {student.groupName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">{student.groupName}</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
              Yozilgan: {formatDate(enrollment.enrolledAt)}
            </span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Zap className="h-5 w-5 text-amber-400" />, label: "O'rtacha mastery", value: `${Math.round(avgMastery * 100)}%`, border: "border-amber-500/20", glow: "bg-amber-500/5", iconBg: "bg-amber-500/10" },
            { icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />, label: "O'zlashtirilgan", value: `${topicsMastered} / ${topics.length}`, border: "border-emerald-500/20", glow: "bg-emerald-500/5", iconBg: "bg-emerald-500/10" },
            { icon: <BookOpen className="h-5 w-5 text-blue-400" />, label: "Boshlangan mavzu", value: `${topicsStarted} / ${topics.length}`, border: "border-blue-500/20", glow: "bg-blue-500/5", iconBg: "bg-blue-500/10" },
            { icon: <Zap className="h-5 w-5 text-violet-400" />, label: "Amaliyot aniqligi", value: totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—", border: "border-violet-500/20", glow: "bg-violet-500/5", iconBg: "bg-violet-500/10", sub: `${totalAttempts} ta savol` },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.glow} p-4`}>
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className="f-syne text-xl font-bold text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-wide font-medium">{s.label}</p>
              {"sub" in s && s.sub && <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic breakdown */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Mavzular bo&apos;yicha progress</h3>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${topics.length > 0 ? (topicsMastered / topics.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="divide-y divide-slate-800/60">
                {topics.map((topic) => {
                  const k = topic.learnerKnowledge[0];
                  const mastery = k?.masteryScore ?? null;
                  return (
                    <div
                      key={topic.id}
                      className="flex items-center gap-3 text-sm px-5 py-2.5 hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="text-slate-700 text-xs w-5 text-right shrink-0">
                        {topic.orderIndex + 1}
                      </span>
                      <span className="flex-1 text-slate-400 truncate">{topic.title}</span>
                      {k ? (
                        <>
                          <span className="text-xs text-slate-600 hidden sm:block shrink-0">
                            {k.attempts} urinish
                          </span>
                          {k.lastPracticedAt && (
                            <span className="text-xs text-slate-600 hidden md:block shrink-0">
                              <Clock className="inline h-3 w-3 mr-0.5" />
                              {formatDate(k.lastPracticedAt)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-700 hidden sm:block">—</span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${masteryColor(mastery)}`}
                      >
                        {mastery !== null ? `${Math.round(mastery * 100)}%` : "Boshlanmagan"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: cognitive profile */}
          <div>
            {student.cognitiveProfile ? (
              <CognitiveProfileCard
                attentionScore={student.cognitiveProfile.attentionScore}
                workingMemoryScore={student.cognitiveProfile.workingMemoryScore}
                processingSpeedScore={student.cognitiveProfile.processingSpeedScore}
                memoryScore={student.cognitiveProfile.memoryScore}
              />
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 py-10 flex flex-col items-center gap-3 text-center">
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
