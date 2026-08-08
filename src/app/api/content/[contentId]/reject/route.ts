import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const content = await db.contentItem.findUnique({
    where: { id: contentId },
    include: { topic: { include: { course: { select: { professorId: true } } } } },
  });

  if (!content || content.topic.course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const updated = await db.contentItem.update({
    where: { id: contentId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json(updated);
}
