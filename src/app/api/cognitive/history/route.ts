import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  // Professor/admin o'zganing tarixini ko'rishi uchun studentId param
  const requestedId = searchParams.get("studentId");

  let studentId: string;

  if (requestedId && (session.user.role === "PROFESSOR" || session.user.role === "ADMIN")) {
    studentId = requestedId;
  } else {
    // Talaba faqat o'zini ko'radi
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "studentId kerak" }, { status: 400 });
    }
    studentId = session.user.profileId;
  }

  const history = await db.cognitiveHistory.findMany({
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
  });

  return NextResponse.json({ history });
}
