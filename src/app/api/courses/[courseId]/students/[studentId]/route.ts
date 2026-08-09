import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// DELETE /api/courses/[courseId]/students/[studentId]
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
  if (!course) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  await db.enrollment.delete({
    where: { studentId_courseId: { studentId, courseId } },
  });

  return NextResponse.json({ ok: true });
}
