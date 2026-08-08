import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assignMissingResearchIds } from "@/lib/research/anonymize";

export async function POST() {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const assigned = await assignMissingResearchIds();
  return NextResponse.json({ assigned });
}
