import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(6),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { firstName, lastName, email, password, title } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { email: ["Bu email allaqachon ro'yxatdan o'tgan"] } }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: "PROFESSOR",
      professor: {
        create: { firstName, lastName, title: title ?? null },
      },
    },
    include: { professor: { select: { id: true } } },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
