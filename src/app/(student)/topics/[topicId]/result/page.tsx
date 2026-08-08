import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { decideNextAction } from "@/lib/modules/adaptive/engine";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MasteryBadge } from "@/components/shared/mastery-badge";
import {
  CheckCircle2, ArrowRight, RotateCcw, BookOpen,
  Layers, ArrowLeft, Zap, BookMarked
} from "lucide-react";

const ACTION_CONFIG: Record<string, {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}> = {
  CONTINUE: {
    title: "Keyingi mavzuga o'ting",
    description: "Ajoyib! Siz bu mavzuni yaxshi o'zlashtirdingiz. Oldinga!",
    color: "from-emerald-50 to-green-50 border-emerald-200",
    icon: <ArrowRight className="h-6 w-6 text-emerald-600" />,
  },
  PRACTICE: {
    title: "Ko'proq mashq qiling",
    description: "Yaxshi harakat! Mustahkamlash uchun yana bir necha savol yechib ko'ring.",
    color: "from-blue-50 to-indigo-50 border-blue-200",
    icon: <Zap className="h-6 w-6 text-blue-600" />,
  },
  EXPLAIN_AGAIN: {
    title: "Mavzuni qayta o'rganing",
    description: "Mavzuni yana bir bor o'qib chiqing, keyin mashq qiling.",
    color: "from-amber-50 to-yellow-50 border-amber-200",
    icon: <BookOpen className="h-6 w-6 text-amber-600" />,
  },
  PREREQUISITE: {
    title: "Avvalgi mavzuni mustahkamlang",
    description: "Bu mavzuni tushunish uchun avval oldingi mavzuni yaxshi o'zlashtirib oling.",
    color: "from-orange-50 to-red-50 border-orange-200",
    icon: <Layers className="h-6 w-6 text-orange-600" />,
  },
  RETRIEVE: {
    title: "Takrorlash vaqti",
    description: "O'tgan mavzuni eslash vaqti keldi. Aralashish (interleaving) xotirani mustahkamlaydi.",
    color: "from-purple-50 to-violet-50 border-purple-200",
    icon: <RotateCcw className="h-6 w-6 text-purple-600" />,
  },
  ADVANCED_PRACTICE: {
    title: "Murakkab savollar",
    description: "Zo'r! Siz shu mavzuni mukammal o'zlashtirdingiz. Murakkab topshiriqlar vaqti!",
    color: "from-pink-50 to-rose-50 border-pink-200",
    icon: <BookMarked className="h-6 w-6 text-pink-600" />,
  },
};

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const [topic, knowledge, recentAttempts, retentionRecord] = await Promise.all([
    db.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true, title: true, courseId: true,
        orderIndex: true,
        course: { select: { id: true, title: true } },
        prerequisiteTopic: { select: { id: true, title: true } },
      },
    }),
    db.learnerKnowledge.findUnique({
      where: { studentId_topicId: { studentId, topicId } },
    }),
    db.attempt.findMany({
      where: { studentId, question: { topicId } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { isCorrect: true },
    }),
    db.retrievalRecord.findFirst({
      where: { studentId, topicId, status: "PENDING" },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  if (!topic) notFound();

  const mastery = knowledge?.masteryScore ?? 0;
  const repeatedErrors = recentAttempts.filter((a) => !a.isCorrect).length;
  const retentionDue =
    retentionRecord && retentionRecord.dueAt <= new Date()
      ? (knowledge?.retrievalScore ?? 0)
      : 0;

  const decision = decideNextAction({
    masteryScore: mastery,
    recentAccuracy: knowledge?.recentAccuracy ?? 0,
    repeatedErrors,
    retentionScore: retentionDue,
    attemptsOnTopic: knowledge?.attempts ?? 0,
  });

  // Get next topic for CONTINUE
  let nextTopic: { id: string; title: string } | null = null;
  if (decision.action === "CONTINUE") {
    nextTopic = await db.topic.findFirst({
      where: { courseId: topic.courseId, orderIndex: { gt: topic.orderIndex } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, title: true },
    });
  }

  const cfg = ACTION_CONFIG[decision.action] ?? ACTION_CONFIG.PRACTICE;

  function getActionHref() {
    switch (decision.action) {
      case "CONTINUE": return nextTopic ? `/topics/${nextTopic.id}` : `/courses/${topic!.courseId}`;
      case "PRACTICE": return `/topics/${topicId}/practice`;
      case "EXPLAIN_AGAIN": return `/topics/${topicId}`;
      case "PREREQUISITE": return topic?.prerequisiteTopic ? `/topics/${topic.prerequisiteTopic.id}` : `/topics/${topicId}`;
      case "RETRIEVE": return `/dashboard`;
      case "ADVANCED_PRACTICE": return `/topics/${topicId}/practice`;
      default: return `/courses/${topic!.courseId}`;
    }
  }

  function getActionLabel() {
    switch (decision.action) {
      case "CONTINUE": return nextTopic ? `${nextTopic.title}ga o'tish` : "Kursga qaytish";
      case "PRACTICE": return "Mashqni davom ettirish";
      case "EXPLAIN_AGAIN": return "Mavzuni qayta o'qish";
      case "PREREQUISITE": return topic?.prerequisiteTopic ? `${topic.prerequisiteTopic.title}ga o'tish` : "Ortga";
      case "RETRIEVE": return "Takrorlash sahifasi";
      case "ADVANCED_PRACTICE": return "Murakkab mashq";
      default: return "Kursga qaytish";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
        {/* Back */}
        <Link
          href={`/topics/${topicId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> {topic.title}
        </Link>

        {/* Mastery card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Mashq yakunlandi</h1>
              <p className="text-sm text-slate-500 mt-0.5">{topic.title}</p>
            </div>
            <MasteryBadge score={mastery} />
          </CardContent>
        </Card>

        {/* Adaptive recommendation */}
        <Card className={`bg-gradient-to-br border ${cfg.color}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              {cfg.icon}
              <div>
                <h2 className="font-semibold text-slate-900">{cfg.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{cfg.description}</p>
              </div>
            </div>
            <Link href={getActionHref()}>
              <Button className="w-full">
                {getActionLabel()}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <Link href={`/courses/${topic.courseId}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              Kurs ro'yxati
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
