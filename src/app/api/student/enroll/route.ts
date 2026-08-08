import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { courseId } = await req.json().catch(() => ({}));
  if (!courseId) return NextResponse.json({ error: "courseId kerak" }, { status: 400 });

  const existing = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.profileId, courseId } },
  });

  if (existing) return NextResponse.json({ error: "Allaqachon yozilgan" }, { status: 409 });

  const enrollment = await db.enrollment.create({
    data: { studentId: session.user.profileId, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
