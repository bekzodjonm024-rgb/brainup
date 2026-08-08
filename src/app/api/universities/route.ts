import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const universities = await db.university.findMany({
    orderBy: { name: "asc" },
    include: {
      faculties: { select: { id: true, name: true }, orderBy: { name: "asc" } },
    },
  });
  return NextResponse.json(universities);
}
