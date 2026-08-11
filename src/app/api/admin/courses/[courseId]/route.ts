import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { isActive } = await req.json();
  const updated = await db.course.update({
    where: { id: courseId },
    data: { isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json(updated);
}
