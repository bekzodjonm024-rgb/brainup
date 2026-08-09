import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  title: z.string().max(50).optional(),
  yearLevel: z.number().int().min(1).max(6).optional(),
  groupName: z.string().max(20).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const { firstName, lastName, title, yearLevel, groupName } = parsed.data;
  const role = session.user.role;

  if (role === "STUDENT") {
    await db.student.update({
      where: { id: session.user.profileId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(yearLevel && { yearLevel }),
        ...(groupName !== undefined && { groupName }),
      },
    });
  } else if (role === "PROFESSOR") {
    await db.professor.update({
      where: { id: session.user.profileId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(title !== undefined && { title }),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
