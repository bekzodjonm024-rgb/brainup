import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDayPlan, calcCycleDay, isDiagnosticDue } from "@/lib/modules/training/plan-generator";

function todayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const studentId = session.user.profileId;

  const [student, profile] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
      select: { nextDiagnosticAt: true },
    }),
    db.cognitiveProfile.findUnique({
      where: { studentId },
      select: { attentionScore: true, workingMemoryScore: true, processingSpeedScore: true, memoryScore: true },
    }),
  ]);

  // Kognitiv profil yo'q → avval diagnostik test topshirish kerak
  if (!profile) {
    return NextResponse.json({ status: "NO_PROFILE" });
  }

  // Diagnostik test vaqti kelgan
  if (isDiagnosticDue(student?.nextDiagnosticAt ?? null)) {
    return NextResponse.json({ status: "DIAGNOSTIC_DUE" });
  }

  const today = todayUTC();

  // Bugungi reja allaqachon bormi?
  const existing = await db.dailyTrainingPlan.findUnique({
    where: { studentId_planDate: { studentId, planDate: today } },
    include: { trainingSessions: true },
  });

  if (existing) {
    return NextResponse.json({ status: "OK", plan: existing });
  }

  // Yangi reja yaratish
  const scores = {
    attentionScore: profile.attentionScore ?? 50,
    workingMemoryScore: profile.workingMemoryScore ?? 50,
    processingSpeedScore: profile.processingSpeedScore ?? 50,
    memoryScore: profile.memoryScore ?? 50,
  };

  // nextDiagnosticAt 10 kun oldin bo'lgan → lastDiagnosticAt = nextDiagnosticAt - 10 kun
  const nextDiag = student?.nextDiagnosticAt ?? null;
  const lastDiagnosticAt = nextDiag
    ? new Date(nextDiag.getTime() - 10 * 24 * 60 * 60 * 1000)
    : null;

  const cycleDay = calcCycleDay(lastDiagnosticAt);
  const exercises = generateDayPlan(cycleDay, scores);

  const plan = await db.dailyTrainingPlan.create({
    data: { studentId, planDate: today, cycleDay, exercises: exercises as object[] },
    include: { trainingSessions: true },
  });

  return NextResponse.json({ status: "OK", plan });
}
