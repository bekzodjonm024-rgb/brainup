import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import Link from "next/link";
import {
  BookOpen, Brain, RefreshCw, TrendingUp, ArrowRight,
  Zap, RotateCcw, Layers, PlayCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

const ACTION_PRIORITY: Record<string, number> = {
  PREREQUISITE: 5, RETRIEVE: 4, EXPLAIN_AGAIN: 3,
  PRACTICE: 2, ADVANCED_PRACTICE: 2, CONTINUE: 1,
};

const ACTION_CONFIG: Record<string, {
  label: string;
  iconCls: string;
  bgCls: string;
  borderCls: string;
  icon: React.ReactNode;
}> = {
  PREREQUISITE:     { label: "Oldingi mavzu", iconCls: "text-amber-400", bgCls: "bg-[#B45309]/10", borderCls: "border-[#B45309]/20", icon: <Layers className="h-4 w-4" /> },
  RETRIEVE:         { label: "Takrorlash",    iconCls: "text-violet-400", bgCls: "bg-violet-500/10", borderCls: "border-violet-500/20", icon: <RotateCcw className="h-4 w-4" /> },
  EXPLAIN_AGAIN:    { label: "Qayta o'qish",  iconCls: "text-amber-400",  bgCls: "bg-amber-500/10",  borderCls: "border-amber-500/20",  icon: <BookOpen className="h-4 w-4" /> },
  PRACTICE:         { label: "Mashq",         iconCls: "text-amber-400",   bgCls: "bg-[#FEF4E7]0/10",   borderCls: "border-[#B45309]/20",   icon: <Zap className="h-4 w-4" /> },
  ADVANCED_PRACTICE:{ label: "Murakkab",      iconCls: "text-pink-400",   bgCls: "bg-pink-500/10",   borderCls: "border-pink-500/20",   icon: <Zap className="h-4 w-4" /> },
  CONTINUE:         { label: "Davom et",      iconCls: "text-emerald-400",bgCls: "bg-emerald-500/10",borderCls: "border-emerald-500/20",icon: <ArrowRight className="h-4 w-4" /> },
  START:            { label: "Boshlash",      iconCls: "text-slate-500 dark:text-slate-400", bgCls: "bg-slate-100 dark:bg-[#1e2840]", borderCls: "border-slate-200 dark:border-white/10", icon: <PlayCircle className="h-4 w-4" /> },
};

function getActionHref(topicId: string, action: string) {
  if (action === "PRACTICE" || action === "ADVANCED_PRACTICE") return `/topics/${topicId}/practice`;
  if (action === "EXPLAIN_AGAIN" || action === "START")        return `/topics/${topicId}`;
  if (action === "RETRIEVE")                                   return `/retrieval`;
  return `/topics/${topicId}`;
}

export default async function DashboardPage() {
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
                  learnerKnowledge: { where: { studentId }, take: 1 },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
        take: 5,
      },
      retrievalRecords: {
        where: { status: "PENDING", dueAt: { lte: new Date() } },
        take: 5,
        include: { topic: { select: { id: true, title: true } } },
      },
    },
  });

  if (!student) redirect("/login");

  const hasAssessment  = !!student.cognitiveProfile;
  const dueRetrievals  = student.retrievalRecords.length;

  const allKnowledge = student.enrollments.flatMap((e) =>
    e.course.topics.flatMap((t) => t.learnerKnowledge)
  );
  const avgMastery = allKnowledge.length
    ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
    : 0;

  interface Rec { topicId: string; topicTitle: string; courseTitle: string; action: string; mastery: number; priority: number }
  const recommendations: Rec[] = [];

  for (const enrollment of student.enrollments) {
    for (const topic of enrollment.course.topics) {
      const knowledge = topic.learnerKnowledge[0];
      if (!knowledge) {
        recommendations.push({
          topicId: topic.id, topicTitle: topic.title,
          courseTitle: enrollment.course.title,
          action: "START", mastery: 0, priority: 0,
        });
        continue;
      }
      const decision = decideNextAction({
        masteryScore: knowledge.masteryScore,
        recentAccuracy: knowledge.recentAccuracy,
        repeatedErrors: 0,
        retentionScore: 0,
        attemptsOnTopic: knowledge.attempts,
      });
      recommendations.push({
        topicId: topic.id, topicTitle: topic.title,
        courseTitle: enrollment.course.title,
        action: decision.action,
        mastery: knowledge.masteryScore,
        priority: ACTION_PRIORITY[decision.action] ?? 0,
      });
    }
  }

  recommendations.sort((a, b) =>
    b.priority !== a.priority ? b.priority - a.priority : a.mastery - b.mastery
  );
  const topRecs = recommendations.slice(0, 3);

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#0e1117]">
      <Header
        title={`Salom, ${student.firstName}!`}
        description="BrainUP — sizning adaptiv o'quv platformangiz"
      />

      <main className="flex-1 p-6 space-y-6">

        {/* Assessment CTA */}
        {!hasAssessment && (
          <div className="rounded-2xl border border-[#B45309]/20 bg-[#FEF4E7]0/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FEF4E7]0/15 border border-[#B45309]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Boshlang&apos;ich baholashni o&apos;ting</h3>
              <p className="text-sm text-slate-500 mt-1">
                10–15 daqiqa. Natijalar sizga shaxsiy o&apos;quv yo&apos;nalishi yaratishga yordam beradi.
              </p>
            </div>
            <Link href="/assessment">
              <Button size="sm" className="shrink-0 bg-[#B45309] hover:bg-[#92400E] border-0 text-white">
                Boshlash <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <BookOpen className="h-5 w-5 text-[#B45309] dark:text-amber-400" />,
              label: "Kurslar",
              value: student.enrollments.length,
              iconBg: "bg-[#FEF4E7] dark:bg-blue-950/50",
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
              label: "O'rtacha mastery",
              value: `${Math.round(avgMastery * 100)}%`,
              iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
              label: "Takrorlash",
              value: dueRetrievals,
              iconBg: "bg-amber-50 dark:bg-amber-950/50",
            },
            {
              icon: <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
              label: "Baholash",
              value: hasAssessment ? "✓ Bajarildi" : "Kutilmoqda",
              iconBg: "bg-violet-50 dark:bg-violet-950/50",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e2840] p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                {s.icon}
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Adaptive recommendations */}
            {topRecs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Keyingi qadam</h2>
                  <span className="text-xs text-slate-400 dark:text-slate-600 uppercase tracking-wide">Adaptiv tavsiya</span>
                </div>
                <div className="space-y-2">
                  {topRecs.map((rec) => {
                    const cfg = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG.PRACTICE;
                    return (
                      <Link key={rec.topicId} href={getActionHref(rec.topicId, rec.action)}>
                        <div className="group rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-4 flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#2a2720]/60 transition-all cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bgCls} ${cfg.borderCls}`}>
                            <span className={cfg.iconCls}>{cfg.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{rec.topicTitle}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600 truncate mt-0.5">{rec.courseTitle}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {rec.mastery > 0 && (
                              <span className="text-xs text-slate-500">
                                {Math.round(rec.mastery * 100)}%
                              </span>
                            )}
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${cfg.bgCls} ${cfg.borderCls} ${cfg.iconCls}`}>
                              {cfg.label}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Kurslarim</h2>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2720] text-xs gap-1">
                    Barchasini ko&apos;rish <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {student.enrollments.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-10 flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#1e2840] border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">Hali kurslarga yozilmadingiz</p>
                  <Link href="/courses">
                    <Button size="sm" className="bg-[#B45309] hover:bg-[#92400E] border-0 text-white">
                      Kurs topish
                    </Button>
                  </Link>
                </div>
              ) : (
                student.enrollments.map((enrollment) => (
                  <CourseCard key={enrollment.id} course={enrollment.course} />
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Retrieval due */}
            {dueRetrievals > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Takrorlash</p>
                    <p className="text-xs text-slate-500">{dueRetrievals} mavzu kutilmoqda</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {student.retrievalRecords.slice(0, 3).map((r) => (
                    <Link key={r.id} href={`/retrieval/${r.topic.id}?recordId=${r.id}`}>
                      <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg hover:bg-amber-500/10 transition-colors group cursor-pointer">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors text-xs">{r.topic.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/retrieval">
                  <Button size="sm" variant="outline" className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 bg-transparent text-xs">
                    Takrorlashni boshlash
                  </Button>
                </Link>
              </div>
            )}

            {/* No assessment notice */}
            {!hasAssessment && (
              <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                <p className="text-xs text-slate-500">Kognitiv profil baholash o&apos;tgandan so&apos;ng ko&apos;rinadi</p>
              </div>
            )}

            {/* Cognitive profile */}
            {hasAssessment && student.cognitiveProfile && (
              <CognitiveProfileCard
                attentionScore={student.cognitiveProfile.attentionScore}
                workingMemoryScore={student.cognitiveProfile.workingMemoryScore}
                processingSpeedScore={student.cognitiveProfile.processingSpeedScore}
                memoryScore={student.cognitiveProfile.memoryScore}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CourseCard({ course }: {
  course: {
    id: string; title: string;
    topics: { id: string; learnerKnowledge: { masteryScore: number }[] }[];
  };
}) {
  const topicsWithMastery  = course.topics.filter((t) => t.learnerKnowledge.length > 0);
  const completedTopics    = topicsWithMastery.filter((t) => t.learnerKnowledge[0].masteryScore >= 0.85).length;
  const totalTopics        = course.topics.length;
  const progress           = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="font-medium text-slate-700 dark:text-slate-200 truncate">{course.title}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{completedTopics}/{totalTopics} mavzu yakunlandi</p>
        </div>
        <Link href={`/courses/${course.id}`}>
          <Button size="sm" variant="outline" className="border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2720] hover:text-slate-700 dark:hover:text-slate-200 shrink-0 text-xs bg-transparent">
            Davom etish
          </Button>
        </Link>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-[#1e2840] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#B45309] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-slate-400 dark:text-slate-700">{Math.round(progress)}% yakunlandi</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-700">{totalTopics} mavzu</span>
      </div>
    </div>
  );
}
