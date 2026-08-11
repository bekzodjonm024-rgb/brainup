import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import Link from "next/link";
import { ArrowLeft, Plus, FileText, Link as LinkIcon, Video, HelpCircle } from "lucide-react";
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={topic.title} description={topic.course.title} />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Link href={`/professor/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> {topic.course.title}
            </Button>
          </Link>
          <div className="flex gap-2">
            <EditTopicDialog
              topicId={topicId}
              currentTitle={topic.title}
              currentObjective={topic.learningObjective}
            />
            <Link href={`/professor/courses/${courseId}/topics/${topicId}/questions`}>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-1" /> Savollar banki
              </Button>
            </Link>
          </div>
        </div>

        {/* Learning objective */}
        {topic.learningObjective && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium text-blue-700 mb-0.5">O'quv maqsadi</p>
            <p className="text-sm text-blue-900">{topic.learningObjective}</p>
          </div>
        )}

        {/* Question count banner */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Savollar banki:
              <strong className="ml-1 text-slate-900">{questionCount} ta savol</strong>
            </span>
            {questionCount === 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                Savollar yo'q — mashq ishlamaydi
              </span>
            )}
          </div>
          <GenerateQuestionsDialog topicId={topicId} />
        </div>

        {/* Content section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Materiallar</h2>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {pendingCount} ta tasdiq kutmoqda
                </span>
              )}
            </div>
            <AddContentDialog topicId={topicId} />
          </div>

          {topic.contentItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-500 mb-3">Hali material qo'shilmagan</p>
              <AddContentDialog topicId={topicId} asButton />
            </div>
          ) : (
            <div className="space-y-2">
              {topic.contentItems.map((item) => {
                const Icon = contentTypeIcon[item.type] ?? FileText;
                return (
                  <Card key={item.id} className={item.status === "APPROVED" ? "border-emerald-200" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-slate-100 p-2 shrink-0">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-slate-900">{item.title}</span>
                            <ContentStatusBadge status={item.status} />
                          </div>
                          {item.body && (
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.body}</p>
                          )}
                          {item.externalUrl && (
                            <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
                               className="text-xs text-blue-600 hover:underline mt-1 block truncate">
                              {item.externalUrl}
                            </a>
                          )}
                          {item.sources.length > 0 && (
                            <p className="text-xs text-slate-400 mt-1">
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
