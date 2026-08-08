import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { MasteryBreakdown } from "@/components/shared/mastery-breakdown";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, FileText, Link as LinkIcon,
  Video, Target, ChevronRight, TrendingUp, Zap,
  RotateCcw, Layers, ArrowRight, BookMarked
} from "lucide-react";
import { ContentType } from "@/generated/prisma";
import { cn } from "@/lib/utils";

const typeIcon: Record<ContentType, React.ElementType> = {
  PDF: FileText, WORD: FileText, PPT: FileText,
  TEXT: FileText, VIDEO: Video, ARTICLE: FileText,
  BOOK: BookOpen, LINK: LinkIcon,
};
const typeLabel: Record<ContentType, string> = {
  PDF: "PDF", WORD: "Word", PPT: "Slayd",
  TEXT: "Matn", VIDEO: "Video", ARTICLE: "Maqola",
  BOOK: "Kitob", LINK: "Havola",
};

const ADAPTIVE_UI: Record<string, { label: string; desc: string; color: string; icon: React.ReactNode }> = {
  CONTINUE:          { label: "Keyingi mavzuga o'ting", desc: "Yaxshi natija! Davom eting.", color: "border-emerald-200 bg-emerald-50", icon: <ArrowRight className="h-4 w-4 text-emerald-600" /> },
  PRACTICE:          { label: "Mashq qiling", desc: "Bilimlarni mustahkamlash uchun mashq kerak.", color: "border-blue-200 bg-blue-50", icon: <Zap className="h-4 w-4 text-blue-600" /> },
  EXPLAIN_AGAIN:     { label: "Qayta o'qing", desc: "Materialni yana bir bor diqqat bilan o'qib chiqing.", color: "border-amber-200 bg-amber-50", icon: <BookOpen className="h-4 w-4 text-amber-600" /> },
  PREREQUISITE:      { label: "Oldingi mavzuni kuchaytiring", desc: "Avval oldingi mavzuni yaxshilang.", color: "border-orange-200 bg-orange-50", icon: <Layers className="h-4 w-4 text-orange-600" /> },
  RETRIEVE:          { label: "Takrorlash vaqti", desc: "Bu mavzuni eslash vaqti keldi.", color: "border-purple-200 bg-purple-50", icon: <RotateCcw className="h-4 w-4 text-purple-600" /> },
  ADVANCED_PRACTICE: { label: "Murakkab mashq", desc: "Siz mukammal! Yuqori darajaga o'ting.", color: "border-pink-200 bg-pink-50", icon: <BookMarked className="h-4 w-4 text-pink-600" /> },
};

export default async function TopicLearningPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: {
      course: { select: { id: true, title: true } },
      contentItems: {
        where: { status: "APPROVED" },
        orderBy: { orderIndex: "asc" },
        include: { sources: true },
      },
      learnerKnowledge: { where: { studentId }, take: 1 },
      prerequisiteTopic: { select: { id: true, title: true } },
    },
  });

  if (!topic) notFound();

  const knowledge = topic.learnerKnowledge[0];
  const mastery = knowledge?.masteryScore ?? 0;
  const attempts = knowledge?.attempts ?? 0;
  const hasStarted = attempts > 0;

  // Get adaptive decision if student has started
  let adaptiveDecision: { action: string; reason: string } | null = null;
  if (hasStarted && knowledge) {
    adaptiveDecision = decideNextAction({
      masteryScore: knowledge.masteryScore,
      recentAccuracy: knowledge.recentAccuracy,
      repeatedErrors: 0,
      retentionScore: knowledge.retrievalScore,
      attemptsOnTopic: knowledge.attempts,
    });
  }

  // Log lesson started event
  await db.learningEvent.create({
    data: {
      studentId,
      topicId,
      courseId: topic.courseId,
      eventType: "LESSON_STARTED",
    },
  });

  const adaptiveUI = adaptiveDecision ? ADAPTIVE_UI[adaptiveDecision.action] : null;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={topic.title} description={topic.course.title} />
      <main className="flex-1 p-6 max-w-3xl space-y-5">
        <Link href={`/courses/${topic.courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> {topic.course.title}
          </Button>
        </Link>

        {/* Learning objective */}
        {topic.learningObjective && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 flex gap-3">
              <Target className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-1">O'quv maqsadi</p>
                <p className="text-sm text-blue-900">{topic.learningObjective}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mastery panel */}
        {hasStarted && knowledge && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  O'zlashtirish darajasi
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{attempts} ta urinish</span>
                  <MasteryBadge score={mastery} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <MasteryBreakdown
                recentAccuracy={knowledge.recentAccuracy}
                historicalAccuracy={knowledge.historicalAccuracy}
                retrievalScore={knowledge.retrievalScore}
                consistencyScore={knowledge.consistencyScore}
              />
            </CardContent>
          </Card>
        )}

        {/* Adaptive recommendation */}
        {adaptiveUI && (
          <div className={cn("rounded-xl border p-4 flex items-start gap-3", adaptiveUI.color)}>
            {adaptiveUI.icon}
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{adaptiveUI.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{adaptiveUI.desc}</p>
            </div>
          </div>
        )}

        {/* Content items */}
        {topic.contentItems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Material hali qo'shilmagan</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topic.contentItems.map((item) => {
              const Icon = typeIcon[item.type] ?? FileText;
              const isLink = item.externalUrl && ["LINK", "VIDEO", "ARTICLE"].includes(item.type);

              return (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-slate-100 p-1.5">
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">{typeLabel[item.type]}</Badge>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {item.body && (
                      <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                        {item.body}
                      </div>
                    )}
                    {isLink && (
                      <a
                        href={item.externalUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Manbani ochish
                      </a>
                    )}
                    {item.sources.length > 0 && (
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-medium text-slate-500 mb-2">Ilmiy manbalar:</p>
                        <ul className="space-y-1">
                          {item.sources.map((s) => (
                            <li key={s.id} className="text-xs text-slate-600">
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noopener noreferrer"
                                   className="text-blue-600 hover:underline">{s.title}</a>
                              ) : (
                                s.title
                              )}
                              {s.authors && <span className="text-slate-400"> — {s.authors}</span>}
                              {s.year && <span className="text-slate-400"> ({s.year})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Practice CTA */}
        {topic.contentItems.length > 0 && (
          <div className="flex justify-end pt-2">
            <Link href={`/topics/${topicId}/practice`}>
              <Button className="gap-2">
                Mashqga o'tish <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
