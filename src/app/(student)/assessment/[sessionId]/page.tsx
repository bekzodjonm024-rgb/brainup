import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AssessmentRunner } from "./assessment-runner";

export default async function AssessmentSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const assessmentSession = await db.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      assessment: {
        include: {
          items: { orderBy: { orderIndex: "asc" } },
        },
      },
      answers: { select: { itemId: true } },
    },
  });

  if (!assessmentSession || assessmentSession.studentId !== session.user.profileId) {
    redirect("/assessment");
  }

  if (assessmentSession.status === "COMPLETED") {
    redirect("/assessment");
  }

  const answeredItemIds = new Set(assessmentSession.answers.map((a) => a.itemId));
  const items = assessmentSession.assessment.items;
  const nextItemIndex = items.findIndex((item) => !answeredItemIds.has(item.id));

  // Use per-session random overrides when available (generated at session creation)
  const overrides = (assessmentSession.itemOverrides ?? {}) as Record<string, unknown>;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-950">
      <AssessmentRunner
        sessionId={sessionId}
        items={items.map((item) => ({
          id: item.id,
          category: item.category,
          taskType: item.taskType,
          prompt: item.prompt,
          stimuluData: (overrides[item.id] ?? item.stimuluData) as Record<string, unknown>,
        }))}
        initialItemIndex={nextItemIndex >= 0 ? nextItemIndex : items.length}
        totalItems={items.length}
      />
    </div>
  );
}
