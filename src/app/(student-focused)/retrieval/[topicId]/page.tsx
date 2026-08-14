import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { RetrievalSession } from "./retrieval-session";

export default async function RetrievalTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ recordId?: string }>;
}) {
  const { topicId } = await params;
  const { recordId } = await searchParams;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  if (!recordId) redirect("/retrieval");

  const [record, topic] = await Promise.all([
    db.retrievalRecord.findUnique({
      where: { id: recordId },
    }),
    db.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true, title: true, courseId: true,
        course: { select: { title: true } },
        learnerKnowledge: {
          where: { studentId },
          take: 1,
          select: { masteryScore: true, retrievalScore: true },
        },
        _count: { select: { questions: true } },
      },
    }),
  ]);

  if (!record || record.studentId !== studentId || record.status !== "PENDING") {
    redirect("/retrieval");
  }
  if (!topic) notFound();

  const knowledge = topic.learnerKnowledge[0];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <RetrievalSession
        topicId={topicId}
        topicTitle={topic.title}
        courseTitle={topic.course.title}
        recordId={recordId}
        intervalDays={record.intervalDays}
        initialMastery={knowledge?.masteryScore ?? 0}
        initialRetrievalScore={knowledge?.retrievalScore ?? 0}
        sessionTarget={Math.min(8, Math.max(5, topic._count.questions))}
      />
    </div>
  );
}
