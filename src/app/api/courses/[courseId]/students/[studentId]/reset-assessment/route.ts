import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE — professor resets a student's cognitive profile so they can retake
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; studentId: string }> }
) {
  const { courseId, studentId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { professorId: true },
  });
  if (!course || course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  // Cancel any in-progress session and delete cognitive profile
  await db.$transaction([
    db.assessmentSession.updateMany({
      where: { studentId, status: "IN_PROGRESS" },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    db.cognitiveProfile.deleteMany({ where: { studentId } }),
  ]);

  return NextResponse.json({ ok: true });
}
