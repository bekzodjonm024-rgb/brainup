import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import {
  BookOpen, Brain, RefreshCw, TrendingUp, ArrowRight,
  Zap, RotateCcw, Layers, AlertCircle, PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_PRIORITY: Record<string, number> = {
  PREREQUISITE: 5, RETRIEVE: 4, EXPLAIN_AGAIN: 3, PRACTICE: 2, ADVANCED_PRACTICE: 2, CONTINUE: 1,
};

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PREREQUISITE: { label: "Oldingi mavzu", color: "text-orange-600 bg-orange-50 border-orange-200", icon: <Layers className="h-3.5 w-3.5" /> },
  RETRIEVE:     { label: "Takrorlash", color: "text-purple-600 bg-purple-50 border-purple-200", icon: <RotateCcw className="h-3.5 w-3.5" /> },
  EXPLAIN_AGAIN:{ label: "Qayta o'qish", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <BookOpen className="h-3.5 w-3.5" /> },
  PRACTICE:     { label: "Mashq", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Zap className="h-3.5 w-3.5" /> },
  ADVANCED_PRACTICE: { label: "Murakkab", color: "text-pink-600 bg-pink-50 border-pink-200", icon: <Zap className="h-3.5 w-3.5" /> },
  CONTINUE:     { label: "Davom et", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <ArrowRight className="h-3.5 w-3.5" /> },
  START:        { label: "Boshlash", color: "text-slate-600 bg-slate-50 border-slate-200", icon: <PlayCircle className="h-3.5 w-3.5" /> },
};

function getActionHref(topicId: string, action: string) {
  if (action === "PRACTICE" || action === "ADVANCED_PRACTICE") return `/topics/${topicId}/practice`;
  if (action === "EXPLAIN_AGAIN" || action === "START") return `/topics/${topicId}`;
  if (action === "RETRIEVE") return `/topics/${topicId}/practice`;
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

  const hasAssessment = !!student.cognitiveProfile;
  const dueRetrievals = student.retrievalRecords.length;

  const allKnowledge = student.enrollments.flatMap((e) =>
    e.course.topics.flatMap((t) => t.learnerKnowledge)
  );
  const avgMastery = allKnowledge.length
    ? allKnowledge.reduce((s, k) => s + k.masteryScore, 0) / allKnowledge.length
    : 0;

  // Build recommendations from local data (no extra DB queries)
  interface Rec { topicId: string; topicTitle: string; courseTitle: string; action: string; mastery: number; priority: number }
  const recommendations: Rec[] = [];

  for (const enrollment of student.enrollments) {
    for (const topic of enrollment.course.topics) {
      const knowledge = topic.learnerKnowledge[0];
      if (!knowledge) {
        // unstarted
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={`Salom, ${student.firstName}!`}
        description="BrainUP — sizning adaptiv o'quv platformangiz"
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Assessment CTA */}
        {!hasAssessment && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-4">
            <Brain className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Boshlang'ich baholashni o'ting</h3>
              <p className="text-sm text-blue-700 mt-1">
                10–15 daqiqa. Natijalar sizga shaxsiy o'quv yo'nalishi yaratishga yordam beradi.
              </p>
            </div>
            <Link href="/assessment">
              <Button size="sm" className="shrink-0">
                Boshlash <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Kurslar" value={student.enrollments.length} bg="bg-blue-50" />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} label="O'rtacha mastery" value={`${Math.round(avgMastery * 100)}%`} bg="bg-emerald-50" />
          <StatCard icon={<RefreshCw className="h-5 w-5 text-amber-600" />} label="Takrorlash kutilmoqda" value={dueRetrievals} bg="bg-amber-50" />
          <StatCard icon={<Brain className="h-5 w-5 text-violet-600" />} label="Baholash" value={hasAssessment ? "Bajarildi" : "Kutilmoqda"} bg="bg-violet-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Adaptive recommendations */}
            {topRecs.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-slate-900">Keyingi qadam</h2>
                <div className="space-y-2">
                  {topRecs.map((rec) => {
                    const cfg = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG.PRACTICE;
                    return (
                      <Link key={rec.topicId} href={getActionHref(rec.topicId, rec.action)}>
                        <div className={cn(
                          "rounded-lg border p-3.5 flex items-center gap-3 hover:shadow-sm transition-shadow",
                          cfg.color
                        )}>
                          <div className="shrink-0">{cfg.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{rec.topicTitle}</p>
                            <p className="text-xs opacity-70 truncate">{rec.courseTitle}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {rec.mastery > 0 && <MasteryBadge score={rec.mastery} />}
                            <span className="text-xs font-semibold">{cfg.label}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
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
                <h2 className="font-semibold text-slate-900">Kurslarim</h2>
                <Link href="/courses">
                  <Button variant="ghost" size="sm">
                    Barchasini ko'rish <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>

              {student.enrollments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-500">Hali kurslarga yozilmadingiz</p>
                    <Link href="/courses">
                      <Button size="sm">Kurs topish</Button>
                    </Link>
                  </CardContent>
                </Card>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                    Takrorlash
                  </CardTitle>
                  <CardDescription>{dueRetrievals} ta mavzu kutilmoqda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {student.retrievalRecords.slice(0, 3).map((r) => (
                    <Link key={r.id} href={`/topics/${r.topic.id}/practice`}>
                      <div className="flex items-center justify-between text-sm py-1 hover:text-blue-600 transition-colors">
                        <span className="text-slate-700 truncate">{r.topic.title}</span>
                        <Badge variant="warning" className="text-xs ml-2 shrink-0">Muhim</Badge>
                      </div>
                    </Link>
                  ))}
                  <Link href="/retrieval">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Takrorlashni boshlash
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode; label: string; value: string | number; bg: string;
}) {
  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`rounded-xl p-2.5 ${bg} shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCard({ course }: {
  course: {
    id: string; title: string;
    topics: { id: string; learnerKnowledge: { masteryScore: number }[] }[];
  };
}) {
  const topicsWithMastery = course.topics.filter((t) => t.learnerKnowledge.length > 0);
  const completedTopics = topicsWithMastery.filter((t) => t.learnerKnowledge[0].masteryScore >= 0.85).length;
  const totalTopics = course.topics.length;
  const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <Card className="hover:border-blue-200 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 truncate">{course.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{completedTopics}/{totalTopics} mavzu yakunlandi</p>
            <Progress value={progress} className="h-1.5 mt-2" />
          </div>
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" variant="outline">Davom etish</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
