import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import Link from "next/link";
import { ArrowLeft, FileText, Link as LinkIcon, Video, HelpCircle } from "lucide-react";
import { ContentType } from "@/generated/prisma";
import { AddContentDialog } from "./add-content-dialog";
import { ContentActions } from "./content-actions";
import { GenerateQuestionsDialog } from "./generate-questions-dialog";
import { EditTopicDialog } from "./edit-topic-dialog";

const contentTypeIcon: Record<ContentType, React.ElementType> = {
  PDF: FileText, WORD: FileText, PPT: FileText,
  TEXT: FileText, VIDEO: Video, ARTICLE: FileText,
  BOOK: FileText, LINK: LinkIcon,
};

export default async function TopicDetailPage({
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
      contentItems: {
        orderBy: { orderIndex: "asc" },
        include: { sources: true },
      },
      prerequisiteTopic: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!topic) notFound();
  if (topic.course.professorId !== session.user.profileId) redirect("/professor/dashboard");

  const pendingCount = topic.contentItems.filter((c) => c.status === "DRAFT" || c.status === "PENDING_REVIEW").length;
  const questionCount = topic._count.questions;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-[#F8F5EF] dark:bg-[#0e1117]">
      <Header title={topic.title} description={topic.course.title} />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Link href={`/professor/courses/${courseId}`}>
            <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] px-3 py-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" /> {topic.course.title}
            </button>
          </Link>
          <div className="flex gap-2">
            <EditTopicDialog
              topicId={topicId}
              currentTitle={topic.title}
              currentObjective={topic.learningObjective}
            />
            <Link href={`/professor/courses/${courseId}/topics/${topicId}/questions`}>
              <button className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a2720] border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <HelpCircle className="h-4 w-4" /> Savollar banki
              </button>
            </Link>
          </div>
        </div>

        {/* Learning objective */}
        {topic.learningObjective && (
          <div className="rounded-xl border border-[#B45309]/20 bg-[#FEF4E7]0/5 px-4 py-3">
            <p className="text-xs font-medium text-amber-400 mb-0.5">O&apos;quv maqsadi</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{topic.learningObjective}</p>
          </div>
        )}

        {/* Question count banner */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35] px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Savollar banki:
              <strong className="ml-1 text-slate-700 dark:text-slate-200">{questionCount} ta savol</strong>
            </span>
            {questionCount === 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                Savollar yo&apos;q — mashq ishlamaydi
              </span>
            )}
          </div>
          <GenerateQuestionsDialog topicId={topicId} />
        </div>

        {/* Content section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Materiallar</h2>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {pendingCount} ta tasdiq kutmoqda
                </span>
              )}
            </div>
            <AddContentDialog topicId={topicId} />
          </div>

          {topic.contentItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/8 p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#1e2840] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 mb-3">Hali material qo&apos;shilmagan</p>
              <AddContentDialog topicId={topicId} asButton />
            </div>
          ) : (
            <div className="space-y-2">
              {topic.contentItems.map((item) => {
                const Icon = contentTypeIcon[item.type] ?? FileText;
                const isApproved = item.status === "APPROVED";
                return (
                  <div key={item.id} className={`rounded-xl border ${isApproved ? "border-emerald-500/20 bg-emerald-500/5" : "border-slate-200 dark:border-white/8 bg-white dark:bg-[#151f35]"} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 shrink-0 ${isApproved ? "bg-emerald-500/10" : "bg-slate-100 dark:bg-[#1e2840]"}`}>
                        <Icon className={`h-4 w-4 ${isApproved ? "text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{item.title}</span>
                          <ContentStatusBadge status={item.status} />
                        </div>
                        {item.body && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.body}</p>
                        )}
                        {item.externalUrl && (
                          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
                             className="text-xs text-amber-400 hover:underline mt-1 block truncate">
                            {item.externalUrl}
                          </a>
                        )}
                        {item.sources.length > 0 && (
                          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                            {item.sources.length} ta ilmiy manba
                          </p>
                        )}
                      </div>
                      <ContentActions
                        contentId={item.id}
                        status={item.status}
                        title={item.title}
                        courseId={courseId}
                        topicId={topicId}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
