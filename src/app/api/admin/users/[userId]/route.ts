import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/admin/users/[userId] — toggle isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  // Prevent admin from deactivating themselves
  if (session.user.id === userId) {
    return NextResponse.json({ error: "O'zingizni o'chira olmaysiz" }, { status: 400 });
  }

  const { isActive } = await req.json();
  const updated = await db.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json(updated);
}
