import type { Metadata } from "next";
export const metadata: Metadata = { title: "Mashq" };

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrainingRunner } from "./training-runner";

const VALID = ["attention", "working_memory", "processing_speed", "memory"];

export default async function TrainingExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ planId?: string; difficulty?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.profileId) redirect("/login");

  const { category } = await params;
  const { planId, difficulty } = await searchParams;

  if (!VALID.includes(category) || !planId || !difficulty) redirect("/training");

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <TrainingRunner
        category={category.toUpperCase() as "ATTENTION" | "WORKING_MEMORY" | "PROCESSING_SPEED" | "MEMORY"}
        difficulty={difficulty as "BASIC" | "INTERMEDIATE" | "ADVANCED"}
        planId={planId}
      />
    </div>
  );
}
