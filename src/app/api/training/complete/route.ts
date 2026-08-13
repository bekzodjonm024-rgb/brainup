import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const studentId = session.user.profileId;
  const { planId, category, difficulty, score } = await req.json();

  if (!planId || !category || !difficulty || score == null) {
    return NextResponse.json({ error: "planId, category, difficulty, score kerak" }, { status: 400 });
  }

  const plan = await db.dailyTrainingPlan.findUnique({
    where: { id: planId },
    include: { trainingSessions: true },
  });

  if (!plan || plan.studentId !== studentId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  // TrainingSession saqlash
  const trainingSession = await db.trainingSession.create({
    data: { studentId, planId, category, difficulty, score },
  });

  // Reja ichidagi exercises ni completed=true qilish
  const exercises = plan.exercises as Array<{ category: string; difficulty: string; order: number; completed: boolean }>;
  const updated = exercises.map((ex) =>
    ex.category === category && !ex.completed ? { ...ex, completed: true } : ex
  );

  const allDone = updated.every((ex) => ex.completed);

  await db.dailyTrainingPlan.update({
    where: { id: planId },
    data: { exercises: updated, isComplete: allDone },
  });

  return NextResponse.json({ ok: true, sessionId: trainingSession.id, allDone });
}
