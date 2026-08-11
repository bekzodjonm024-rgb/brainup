import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING_REVIEW";

  const items = await db.contentItem.findMany({
    where: { status: status as "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
      topic: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
              professor: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(items);
}
