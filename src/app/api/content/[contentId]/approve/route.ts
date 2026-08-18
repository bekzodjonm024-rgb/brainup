import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.profileId || (role !== "PROFESSOR" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const content = await db.contentItem.findUnique({
    where: { id: contentId },
    include: { topic: { include: { course: { select: { professorId: true } } } } },
  });

  if (!content) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  if (role === "PROFESSOR" && content.topic.course.professorId !== session.user.profileId) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const updated = await db.contentItem.update({
    where: { id: contentId },
    data: { status: "APPROVED" },
  });

  return NextResponse.json(updated);
}
