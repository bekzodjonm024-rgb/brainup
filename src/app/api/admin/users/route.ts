import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const role = searchParams.get("role") ?? "STUDENT";

  const users = await db.user.findMany({
    where: {
      role: role as "STUDENT" | "PROFESSOR",
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { student: { firstName: { contains: query, mode: "insensitive" } } },
              { student: { lastName: { contains: query, mode: "insensitive" } } },
              { professor: { firstName: { contains: query, mode: "insensitive" } } },
              { professor: { lastName: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          yearLevel: true,
          groupName: true,
          university: { select: { shortName: true, name: true } },
          _count: { select: { enrollments: true, attempts: true } },
          cognitiveProfile: { select: { id: true } },
        },
      },
      professor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          _count: { select: { courses: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(users);
}
