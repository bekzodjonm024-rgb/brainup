import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Lock, PlayCircle,
  BookOpen, ChevronRight, Zap, RotateCcw, Layers
} from "lucide-react";

const ACTION_CHIP: Record<string, { label: string; border: string; bg: string; text: string; icon: React.ReactNode }> = {
  PRACTICE:          { label: "Mashq kerak", border: "border-[#B45309]/20",    bg: "bg-[#FEF4E7]0/10",    text: "text-amber-400",    icon: <Zap className="h-3 w-3" /> },
  ADVANCED_PRACTICE: { label: "Murakkab",    border: "border-pink-500/20",    bg: "bg-pink-500/10",    text: "text-pink-400",    icon: <Zap className="h-3 w-3" /> },
  EXPLAIN_AGAIN:     { label: "Qayta o'qi",  border: "border-amber-500/20",   bg: "bg-amber-500/10",   text: "text-amber-400",   icon: <BookOpen className="h-3 w-3" /> },
  PREREQUISITE:      { label: "Oldingi mavzu",border: "border-[#B45309]/20", bg: "bg-[#B45309]/10",  text: "text-amber-400",  icon: <Layers className="h-3 w-3" /> },
  RETRIEVE:          { label: "Takrorlash",  border: "border-violet-500/20",  bg: "bg-violet-500/10",  text: "text-violet-400",  icon: <RotateCcw className="h-3 w-3" /> },
  CONTINUE:          { label: "Tayyor",      border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" /> },
};

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) {
    await db.enrollment.create({ data: { studentId, courseId } });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      professor: { select: { firstName: true, lastName: true } },
      topics: {
        orderBy: { orderIndex: "asc" },
        include: {
          contentItems: { where: { status: "APPROVED" }, select: { id: true } },
          learnerKnowledge: { where: { studentId }, take: 1 },
          prerequisiteTopic: { select: { id: true, title: true } },
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!course) notFound();

  const masteryByTopicId = new Map<string, number>(
    course.topics.map((t) => [t.id, t.learnerKnowledge[0]?.masteryScore ?? 0])
  );

  const masteredTopics = course.topics.filter(
    (t) => (t.learnerKnowledge[0]?.masteryScore ?? 0) >= 0.85
  ).length;
  const progress = course.topics.length > 0 ? (masteredTopics / course.topics.length) * 100 : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#0e1117]">
      <Header title={course.title} description={`${course.professor.firstName} ${course.professor.lastName}`} />
      <main className="flex-1 p-6 space-y-5">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720]">
            <ArrowLeft className="h-4 w-4 mr-1" /> Kurslar
          </Button>
        </Link>

        {/* Course progress */}
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Umumiy progress</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{Math.round(progress)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{masteredTopics}/{course.topics.length}</p>
              <p className="text-xs text-slate-400 dark:text-slate-600">mavzu o'zlashtirildi</p>
            </div>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-[#1e2840] rounded-full overflow-hidden">
            <div className="h-full bg-[#B45309] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Topics list */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-300">Mavzular</h2>
          {course.topics.map((topic, idx) => {
            const knowledge = topic.learnerKnowledge[0];
            const mastery = knowledge?.masteryScore ?? 0;
            const hasContent = topic.contentItems.length > 0;
            const isMastered = mastery >= 0.85;
            const isStarted = mastery > 0;
            const prereqMastery = topic.prerequisiteTopic
              ? (masteryByTopicId.get(topic.prerequisiteTopic.id) ?? 0)
              : 1;
            const prereqLocked = topic.prerequisiteTopic && prereqMastery < 0.6;
            const isLocked = !hasContent || !!prereqLocked;

            let actionChip: typeof ACTION_CHIP[string] | null = null;
            if (isStarted && knowledge) {
              const decision = decideNextAction({
                masteryScore: knowledge.masteryScore,
                recentAccuracy: knowledge.recentAccuracy,
                repeatedErrors: 0,
                retentionScore: knowledge.retrievalScore,
                attemptsOnTopic: knowledge.attempts,
              });
              actionChip = ACTION_CHIP[decision.action] ?? null;
            }

            return (
              <div
                key={topic.id}
                className={`rounded-xl border bg-white dark:bg-[#151f35] p-4 flex items-center gap-3 transition-colors ${
                  isMastered ? "border-emerald-500/20 bg-emerald-500/5" :
                  isLocked ? "border-slate-200 dark:border-white/8 opacity-60" :
                  "border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="shrink-0">
                  {isMastered ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isStarted ? (
                    <PlayCircle className="h-5 w-5 text-amber-400" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-600">{idx + 1}</span>
                    <h3 className="font-medium text-slate-700 dark:text-slate-200">{topic.title}</h3>
                    {isStarted && <MasteryBadge score={mastery} />}
                    {actionChip && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 border ${actionChip.border} ${actionChip.bg} ${actionChip.text}`}>
                        {actionChip.icon}
                        {actionChip.label}
                      </span>
                    )}
                  </div>
                  {topic.learningObjective && (
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5 line-clamp-1">{topic.learningObjective}</p>
                  )}
                  {prereqLocked && topic.prerequisiteTopic && (
                    <p className="text-xs text-amber-400 mt-0.5">
                      Avval &quot;{topic.prerequisiteTopic.title}&quot; mavzusini bajaring (≥60%)
                    </p>
                  )}
                  <div className="flex gap-3 text-xs text-slate-400 dark:text-slate-700 mt-1">
                    <span>{topic.contentItems.length} material</span>
                    <span>{topic._count.questions} savol</span>
                  </div>
                </div>

                {!isLocked && (
                  <Link href={`/topics/${topic.id}`}>
                    <Button
                      size="sm"
                      className={isMastered
                        ? "border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2a2720] bg-transparent"
                        : "bg-[#B45309] hover:bg-[#92400E] text-white border-0"
                      }
                      variant={isMastered ? "outline" : "default"}
                    >
                      {isMastered ? "Takrorlash" : isStarted ? "Davom etish" : "Boshlash"}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
