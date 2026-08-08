import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.profileId) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const assessmentSession = await db.assessmentSession.findUnique({
    where: { id: sessionId },
  });
  if (!assessmentSession || assessmentSession.studentId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }
  if (assessmentSession.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Sessiya tugallangan" }, { status: 400 });
  }

  const { itemId, givenAnswer, responseTimeMs } = await req.json();

  const existing = await db.assessmentAnswer.findFirst({
    where: { sessionId, itemId },
  });
  if (existing) return NextResponse.json(existing);

  const answer = await db.assessmentAnswer.create({
    data: {
      sessionId,
      itemId,
      givenAnswer,
      responseTimeMs: responseTimeMs ?? null,
    },
  });

  return NextResponse.json(answer, { status: 201 });
}
