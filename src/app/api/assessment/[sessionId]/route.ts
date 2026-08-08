import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const assessmentSession = await db.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      assessment: {
        include: { items: { orderBy: { orderIndex: "asc" } } },
      },
      answers: { select: { itemId: true } },
    },
  });

  if (!assessmentSession || assessmentSession.studentId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  return NextResponse.json(assessmentSession);
}
