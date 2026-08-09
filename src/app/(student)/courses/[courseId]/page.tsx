import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Lock, PlayCircle,
  BookOpen, ChevronRight, Zap, RotateCcw, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_CHIP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PRACTICE:          { label: "Mashq kerak", color: "text-blue-600 bg-blue-50",    icon: <Zap className="h-3 w-3" /> },
  ADVANCED_PRACTICE: { label: "Murakkab",    color: "text-pink-600 bg-pink-50",    icon: <Zap className="h-3 w-3" /> },
  EXPLAIN_AGAIN:     { label: "Qayta o'qi",  color: "text-amber-600 bg-amber-50",  icon: <BookOpen className="h-3 w-3" /> },
  PREREQUISITE:      { label: "Oldingi mavzu",color: "text-orange-600 bg-orange-50",icon: <Layers className="h-3 w-3" /> },
  RETRIEVE:          { label: "Takrorlash",  color: "text-purple-600 bg-purple-50",icon: <RotateCcw className="h-3 w-3" /> },
  CONTINUE:          { label: "Tayyor",      color: "text-emerald-600 bg-emerald-50",icon: <CheckCircle2 className="h-3 w-3" /> },
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

  // Build a mastery lookup for prerequisite checking
  const masteryByTopicId = new Map<string, number>(
    course.topics.map((t) => [t.id, t.learnerKnowledge[0]?.masteryScore ?? 0])
  );

  const masteredTopics = course.topics.filter(
    (t) => (t.learnerKnowledge[0]?.masteryScore ?? 0) >= 0.85
  ).length;
  const progress = course.topics.length > 0 ? (masteredTopics / course.topics.length) * 100 : 0;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={course.title} description={`${course.professor.firstName} ${course.professor.lastName}`} />
      <main className="flex-1 p-6 space-y-5">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Kurslar
          </Button>
        </Link>

        {/* Course progress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500">Umumiy progress</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(progress)}%</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>{masteredTopics}/{course.topics.length} mavzu</p>
                <p>o'zlashtirildi</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Topics list */}
        <div className="space-y-2">
          <h2 className="font-semibold text-slate-900">Mavzular</h2>
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

            // Adaptive action chip
            let actionChip: { label: string; color: string; icon: React.ReactNode } | null = null;
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
              <Card
                key={topic.id}
                className={cn(
                  "transition-colors",
                  isMastered && "border-emerald-200 bg-emerald-50/30",
                  isLocked && "opacity-60"
                )}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="shrink-0">
                    {isMastered ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : isStarted ? (
                      <PlayCircle className="h-5 w-5 text-blue-500" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-slate-300" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-400">{idx + 1}</span>
                      <h3 className="font-medium text-slate-900">{topic.title}</h3>
                      {isStarted && <MasteryBadge score={mastery} />}
                      {actionChip && (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
                          actionChip.color
                        )}>
                          {actionChip.icon}
                          {actionChip.label}
                        </span>
                      )}
                    </div>
                    {topic.learningObjective && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{topic.learningObjective}</p>
                    )}
                    {prereqLocked && topic.prerequisiteTopic && (
                      <p className="text-xs text-orange-600 mt-0.5">
                        Avval &quot;{topic.prerequisiteTopic.title}&quot; mavzusini bajaring (≥60%)
                      </p>
                    )}
                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                      <span>{topic.contentItems.length} material</span>
                      <span>{topic._count.questions} savol</span>
                    </div>
                  </div>

                  {!isLocked && (
                    <Link href={`/topics/${topic.id}`}>
                      <Button size="sm" variant={isMastered ? "outline" : "default"}>
                        {isMastered ? "Takrorlash" : isStarted ? "Davom etish" : "Boshlash"}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
