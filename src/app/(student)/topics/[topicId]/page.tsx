import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import { MasteryBreakdown } from "@/components/shared/mastery-breakdown";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, FileText, Link as LinkIcon,
  Video, Target, ChevronRight, TrendingUp, Zap,
  RotateCcw, Layers, ArrowRight, BookMarked, Download
} from "lucide-react";
import { ContentType } from "@/generated/prisma";

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

const ADAPTIVE_UI: Record<string, { label: string; desc: string; border: string; iconBg: string; icon: React.ReactNode }> = {
  CONTINUE:          { label: "Keyingi mavzuga o'ting",       desc: "Yaxshi natija! Davom eting.",                        border: "border-emerald-500/20", iconBg: "bg-emerald-500/10", icon: <ArrowRight className="h-4 w-4 text-emerald-400" /> },
  PRACTICE:          { label: "Mashq qiling",                  desc: "Bilimlarni mustahkamlash uchun mashq kerak.",         border: "border-blue-500/20",    iconBg: "bg-blue-500/10",    icon: <Zap className="h-4 w-4 text-blue-400" /> },
  EXPLAIN_AGAIN:     { label: "Qayta o'qing",                  desc: "Materialni yana bir bor diqqat bilan o'qib chiqing.", border: "border-amber-500/20",   iconBg: "bg-amber-500/10",   icon: <BookOpen className="h-4 w-4 text-amber-400" /> },
  PREREQUISITE:      { label: "Oldingi mavzuni kuchaytiring",  desc: "Avval oldingi mavzuni yaxshilang.",                  border: "border-orange-500/20",  iconBg: "bg-orange-500/10",  icon: <Layers className="h-4 w-4 text-orange-400" /> },
  RETRIEVE:          { label: "Takrorlash vaqti",              desc: "Bu mavzuni eslash vaqti keldi.",                     border: "border-violet-500/20",  iconBg: "bg-violet-500/10",  icon: <RotateCcw className="h-4 w-4 text-violet-400" /> },
  ADVANCED_PRACTICE: { label: "Murakkab mashq",                desc: "Siz mukammal! Yuqori darajaga o'ting.",              border: "border-pink-500/20",    iconBg: "bg-pink-500/10",    icon: <BookMarked className="h-4 w-4 text-pink-400" /> },
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

  if (topic.prerequisiteTopic) {
    const prereqKnowledge = await db.learnerKnowledge.findFirst({
      where: { studentId, topicId: topic.prerequisiteTopic.id },
      select: { masteryScore: true },
    });
    const prereqMastery = prereqKnowledge?.masteryScore ?? 0;
    if (prereqMastery < 0.6) {
      return (
        <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
          <Header title={topic.title} description={topic.course.title} />
          <main className="flex-1 p-6 max-w-3xl">
            <Link href={`/courses/${topic.courseId}`}>
              <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> {topic.course.title}
              </Button>
            </Link>
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-400">Bu mavzu qulflangan</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Avval <strong className="text-slate-600 dark:text-slate-300">&quot;{topic.prerequisiteTopic.title}&quot;</strong> mavzusini{" "}
                  kamida 60% o&apos;zlashtiring.
                </p>
                <Link href={`/topics/${topic.prerequisiteTopic.id}`} className="mt-3 inline-block">
                  <Button size="sm" className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent">
                    O&apos;sha mavzuga o&apos;tish <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      );
    }
  }

  const knowledge = topic.learnerKnowledge[0];
  const mastery = knowledge?.masteryScore ?? 0;
  const attempts = knowledge?.attempts ?? 0;
  const hasStarted = attempts > 0;

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

  const adaptiveUI = adaptiveDecision ? ADAPTIVE_UI[adaptiveDecision.action] : null;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white dark:bg-slate-950">
      <Header title={topic.title} description={topic.course.title} />
      <main className="flex-1 p-6 max-w-3xl space-y-5">
        <Link href={`/courses/${topic.courseId}`}>
          <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-1" /> {topic.course.title}
          </Button>
        </Link>

        {/* Learning objective */}
        {topic.learningObjective && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">O&apos;quv maqsadi</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{topic.learningObjective}</p>
            </div>
          </div>
        )}

        {/* Mastery panel */}
        {hasStarted && knowledge && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                O&apos;zlashtirish darajasi
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-600">{attempts} ta urinish</span>
                <MasteryBadge score={mastery} />
              </div>
            </div>
            <MasteryBreakdown
              recentAccuracy={knowledge.recentAccuracy}
              historicalAccuracy={knowledge.historicalAccuracy}
              retrievalScore={knowledge.retrievalScore}
              consistencyScore={knowledge.consistencyScore}
            />
          </div>
        )}

        {/* Adaptive recommendation */}
        {adaptiveUI && (
          <div className={`rounded-xl border ${adaptiveUI.border} bg-white dark:bg-slate-900 p-4 flex items-start gap-3`}>
            <div className={`w-8 h-8 rounded-lg ${adaptiveUI.iconBg} flex items-center justify-center shrink-0`}>
              {adaptiveUI.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{adaptiveUI.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{adaptiveUI.desc}</p>
            </div>
          </div>
        )}

        {/* Content items */}
        {topic.contentItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">Material hali qo&apos;shilmagan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topic.contentItems.map((item) => {
              const Icon = typeIcon[item.type] ?? FileText;
              const isLink = item.externalUrl && ["LINK", "VIDEO", "ARTICLE"].includes(item.type);

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5">
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      {typeLabel[item.type]}
                    </span>
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{item.title}</h3>
                  </div>
                  {item.body && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {item.body}
                    </div>
                  )}
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/20 bg-blue-500/5 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Faylni yuklab olish
                    </a>
                  )}
                  {isLink && (
                    <a
                      href={item.externalUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      Manbani ochish
                    </a>
                  )}
                  {item.sources.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-600 mb-2 uppercase tracking-wide">Ilmiy manbalar:</p>
                      <ul className="space-y-1">
                        {item.sources.map((s) => (
                          <li key={s.id} className="text-xs text-slate-500">
                            {s.url ? (
                              <a href={s.url} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-400 hover:text-blue-300">{s.title}</a>
                            ) : (
                              s.title
                            )}
                            {s.authors && <span className="text-slate-400 dark:text-slate-600"> — {s.authors}</span>}
                            {s.year && <span className="text-slate-400 dark:text-slate-600"> ({s.year})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Practice CTA */}
        {topic.contentItems.length > 0 && (
          <div className="flex justify-end pt-2">
            <Link href={`/topics/${topicId}/practice`}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 gap-2">
                Mashqga o&apos;tish <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
