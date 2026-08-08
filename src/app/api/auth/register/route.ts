import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/auth/validation";
import { generateResearchId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, universityId, facultyId, yearLevel, groupName, phone } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: { email: ["Bu email allaqachon ro'yxatdan o'tgan"] } }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        phone: phone ?? null,
        passwordHash,
        role: "STUDENT",
        student: {
          create: {
            firstName,
            lastName,
            universityId,
            facultyId,
            yearLevel,
            groupName: groupName ?? null,
            researchId: generateResearchId(),
          },
        },
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Serverda xatolik yuz berdi" }, { status: 500 });
  }
}
