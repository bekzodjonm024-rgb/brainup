import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CognitiveProfileCard } from "@/components/shared/cognitive-profile-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle2, Zap, BookOpen, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

function masteryColor(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-400";
  if (score >= 0.85) return "bg-emerald-100 text-emerald-700";
  if (score >= 0.6) return "bg-blue-100 text-blue-700";
  if (score >= 0.3) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title={`${student.firstName} ${student.lastName}`}
        description={`${course.title} — talaba hisoboti`}
      />

      <main className="flex-1 p-6 space-y-6">
        <Link href={`/professor/courses/${courseId}/students`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Talabalar ro&apos;yxati
          </Button>
        </Link>

        {/* Student info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-slate-500">{student.user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {student.yearLevel && (
              <Badge variant="secondary">{student.yearLevel}-kurs</Badge>
            )}
            {student.groupName && (
              <Badge variant="secondary">{student.groupName}</Badge>
            )}
            <Badge variant="secondary">
              Yozilgan: {formatDate(enrollment.enrolledAt)}
            </Badge>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat
            icon={<Zap className="h-4 w-4 text-amber-600" />}
            label="O'rtacha mastery"
            value={`${Math.round(avgMastery * 100)}%`}
            bg="bg-amber-50"
          />
          <MiniStat
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            label="O'zlashtirilgan"
            value={`${topicsMastered} / ${topics.length}`}
            bg="bg-emerald-50"
          />
          <MiniStat
            icon={<BookOpen className="h-4 w-4 text-blue-600" />}
            label="Boshlangan mavzu"
            value={`${topicsStarted} / ${topics.length}`}
            bg="bg-blue-50"
          />
          <MiniStat
            icon={<Zap className="h-4 w-4 text-violet-600" />}
            label="Amaliyot aniqligi"
            value={totalAttempts > 0 ? `${Math.round(accuracy * 100)}%` : "—"}
            bg="bg-violet-50"
            sub={`${totalAttempts} ta savol`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic breakdown */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Mavzular bo&apos;yicha progress</CardTitle>
                <Progress
                  value={topics.length > 0 ? (topicsMastered / topics.length) * 100 : 0}
                  className="h-1.5"
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
                        className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0"
                      >
                        <span className="text-slate-400 text-xs w-5 text-right shrink-0">
                          {topic.orderIndex + 1}
                        </span>
                        <span className="flex-1 text-slate-700 truncate">{topic.title}</span>
                        {k ? (
                          <>
                            <span className="text-xs text-slate-400 hidden sm:block shrink-0">
                              {k.attempts} urinish
                            </span>
                            {k.lastPracticedAt && (
                              <span className="text-xs text-slate-400 hidden md:block shrink-0">
                                <Clock className="inline h-3 w-3 mr-0.5" />
                                {formatDate(k.lastPracticedAt)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-300 hidden sm:block">—</span>
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
              </CardContent>
            </Card>
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

function MiniStat({
  icon, label, value, bg, sub,
}: {
  icon: React.ReactNode; label: string; value: string; bg: string; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${bg} shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 truncate">{label}</p>
          <p className="text-base font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
