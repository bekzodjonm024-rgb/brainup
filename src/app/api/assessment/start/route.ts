import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const studentId = session.user.profileId;

  // Check for existing incomplete session
  const existing = await db.assessmentSession.findFirst({
    where: { studentId, status: "IN_PROGRESS" },
    include: { assessment: { include: { items: { orderBy: { orderIndex: "asc" } } } } },
  });
  if (existing) return NextResponse.json(existing);

  // Check if already completed
  const completed = await db.assessmentSession.findFirst({
    where: { studentId, status: "COMPLETED" },
  });
  if (completed) {
    return NextResponse.json({ error: "Baholash allaqachon bajarilgan", completed: true }, { status: 409 });
  }

  const assessment = await db.assessment.findFirst({
    where: { isActive: true },
    include: { items: { orderBy: { orderIndex: "asc" } } },
  });
  if (!assessment) return NextResponse.json({ error: "Baholash topilmadi" }, { status: 404 });

  const assessmentSession = await db.assessmentSession.create({
    data: {
      studentId,
      assessmentId: assessment.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
    include: { assessment: { include: { items: { orderBy: { orderIndex: "asc" } } } } },
  });

  // Log event
  await db.learningEvent.create({
    data: { studentId, eventType: "ASSESSMENT_STARTED" },
  });

  return NextResponse.json(assessmentSession, { status: 201 });
}
