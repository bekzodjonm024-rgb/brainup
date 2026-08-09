import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const [
    totalStudents,
    totalProfessors,
    totalCourses,
    totalEnrollments,
    assessmentsCompleted,
    activeStudents,
  ] = await Promise.all([
    db.student.count(),
    db.professor.count(),
    db.course.count(),
    db.enrollment.count(),
    db.assessmentSession.count({ where: { status: "COMPLETED" } }),
    db.user.count({ where: { role: "STUDENT", isActive: true } }),
  ]);

  return NextResponse.json({
    totalStudents,
    totalProfessors,
    totalCourses,
    totalEnrollments,
    assessmentsCompleted,
    activeStudents,
  });
}
