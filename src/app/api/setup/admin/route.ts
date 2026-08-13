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

  const { setupSecret, email, password, role: rawRole, displayName } = await req.json();
  if (setupSecret.trim() !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "email va kamida 8 belgili parol kerak" }, { status: 400 });
  }

  const allowedRoles = ["ADMIN", "PROFESSOR", "STUDENT"] as const;
  const role = allowedRoles.includes(rawRole) ? rawRole : "ADMIN";

  const passwordHash = await hash(password, 12);
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    const updated = await db.user.update({
      where: { email },
      data: { role, passwordHash, isActive: true, ...(displayName ? { displayName } : {}) },
      select: { id: true, email: true, role: true, isActive: true },
    });
    return NextResponse.json({ message: "Foydalanuvchi yangilandi", user: updated });
  }

  const user = await db.user.create({
    data: { email, passwordHash, role, ...(displayName ? { displayName } : {}) },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ message: "Admin yaratildi", user }, { status: 201 });
}
