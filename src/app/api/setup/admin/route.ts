import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

// One-time admin setup endpoint.
// Requires ADMIN_SETUP_SECRET env var to be set on Vercel.
// DELETE this file or remove the env var after first use.
export async function POST(req: NextRequest) {
  const secret = (process.env.ADMIN_SETUP_SECRET ?? "").trim();
  if (!secret) {
    return NextResponse.json({ error: "Setup disabled" }, { status: 403 });
  }

  const { setupSecret, email, password } = await req.json();
  if (setupSecret.trim() !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "email va kamida 8 belgili parol kerak" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "ADMIN") {
      return NextResponse.json({ message: "Admin allaqachon mavjud" });
    }
    const updated = await db.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, email: true, role: true },
    });
    return NextResponse.json({ message: "ADMIN roliga o'tkazildi", user: updated });
  }

  const passwordHash = await hash(password, 12);
  const user = await db.user.create({
    data: { email, passwordHash, role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ message: "Admin yaratildi", user }, { status: 201 });
}
