import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PracticeSession } from "./practice-session";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      learnerKnowledge: {
        where: { studentId: session.user.profileId },
        take: 1,
      },
    },
  });

  if (!topic) notFound();

  const knowledge = topic.learnerKnowledge[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PracticeSession
        topicId={topicId}
        topicTitle={topic.title}
        courseId={topic.courseId}
        courseTitle={topic.course.title}
        totalQuestions={topic._count.questions}
        initialMastery={knowledge?.masteryScore ?? 0}
        sessionTarget={Math.min(8, Math.max(5, topic._count.questions))}
      />
    </div>
  );
}
