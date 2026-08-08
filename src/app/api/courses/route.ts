import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  semester: z.string().max(50).optional(),
  facultyId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const courses = await db.course.findMany({
    where: { professorId: session.user.profileId },
    include: {
      _count: { select: { enrollments: true, topics: true } },
      faculty: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCourseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const course = await db.course.create({
    data: {
      ...parsed.data,
      professorId: session.user.profileId,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
