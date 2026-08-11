import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const schema = z.object({
  name: z.string().min(2),
  shortName: z.string().optional(),
  city: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const universities = await db.university.findMany({
    select: {
      id: true,
      name: true,
      shortName: true,
      city: true,
      createdAt: true,
      _count: { select: { faculties: true, students: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(universities);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const university = await db.university.create({
    data: parsed.data,
  });

  return NextResponse.json(university, { status: 201 });
}
