import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddQuestionDialog, QuestionList } from "./question-manager";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ courseId: string; topicId: string }>;
}) {
  const { courseId, topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: {
      course: { select: { id: true, title: true, professorId: true } },
      questions: {
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!topic) notFound();
  if (topic.course.professorId !== session.user.profileId) redirect("/professor/dashboard");

  const activeCount = topic.questions.filter((q) => q.isActive).length;
  const totalCount = topic.questions.length;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#f8faff] dark:bg-[#0e1117]">
      <Header title="Savollar banki" description={`${topic.course.title} — ${topic.title}`} />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Link href={`/professor/courses/${courseId}/topics/${topicId}`}>
            <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] px-3 py-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" /> {topic.title}
            </button>
          </Link>
          <AddQuestionDialog topicId={topicId} />
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
          Jami <strong className="text-slate-700 dark:text-slate-200">{totalCount} ta savol</strong>
          {totalCount > 0 && (
            <span className="ml-2 text-slate-400 dark:text-slate-600">({activeCount} ta faol)</span>
          )}
        </div>

        <QuestionList
          questions={topic.questions as Parameters<typeof QuestionList>[0]["questions"]}
          topicId={topicId}
        />
      </main>
    </div>
  );
}
