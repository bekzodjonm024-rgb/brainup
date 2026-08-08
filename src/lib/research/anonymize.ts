import { db } from "@/lib/db";

export function generateResearchId(index: number): string {
  return `P-${String(index).padStart(4, "0")}`;
}

export async function assignMissingResearchIds(): Promise<number> {
  const students = await db.student.findMany({
    where: { researchId: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (students.length === 0) return 0;

  // Find current max index
  const existing = await db.student.findMany({
    where: { researchId: { not: null } },
    select: { researchId: true },
  });

  const maxIndex = existing.reduce((max, s) => {
    const match = s.researchId?.match(/^P-(\d+)$/);
    const n = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, n);
  }, 0);

  let next = maxIndex + 1;
  for (const student of students) {
    await db.student.update({
      where: { id: student.id },
      data: { researchId: generateResearchId(next++) },
    });
  }

  return students.length;
}

export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSVRow(fields: unknown[]): string {
  return fields.map(escapeCSV).join(",");
}
