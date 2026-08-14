import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kognitiv mashqlar" };

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TrainingHub } from "./training-hub";

export default async function TrainingPage() {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const studentId = session.user.profileId;

  const [student, profile, history] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
      select: { nextDiagnosticAt: true },
    }),
    db.cognitiveProfile.findUnique({
      where: { studentId },
      select: {
        attentionScore: true,
        workingMemoryScore: true,
        processingSpeedScore: true,
        memoryScore: true,
      },
    }),
    db.cognitiveHistory.findMany({
      where: { studentId },
      orderBy: { takenAt: "asc" },
      select: {
        id: true,
        attentionScore: true,
        workingMemoryScore: true,
        processingSpeedScore: true,
        memoryScore: true,
        takenAt: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Header title="Kognitiv mashqlar" description="Kunlik trening va rivojlanish grafigi" />
      <main className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full">
        <TrainingHub
          profile={profile}
          nextDiagnosticAt={student?.nextDiagnosticAt?.toISOString() ?? null}
          history={history.map((h) => ({ ...h, takenAt: h.takenAt.toISOString() }))}
        />
      </main>
    </div>
  );
}
