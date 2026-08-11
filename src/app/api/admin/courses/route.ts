import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const courses = await db.course.findMany({
    select: {
      id: true,
      title: true,
      semester: true,
      isActive: true,
      createdAt: true,
      professor: {
        select: { firstName: true, lastName: true, title: true },
      },
      faculty: {
        select: { name: true, university: { select: { shortName: true } } },
      },
      _count: { select: { topics: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}
