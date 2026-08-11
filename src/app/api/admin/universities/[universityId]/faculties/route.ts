import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const schema = z.object({ name: z.string().min(2) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ universityId: string }> }
) {
  const { universityId } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const faculty = await db.faculty.create({
    data: { name: parsed.data.name, universityId },
  });

  return NextResponse.json(faculty, { status: 201 });
}
