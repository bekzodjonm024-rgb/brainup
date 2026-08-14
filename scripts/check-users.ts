import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // Delete admin@xotira.uz if exists
  const xotira = await db.user.findUnique({
    where: { email: "admin@xotira.uz" },
    include: { student: true },
  });

  if (xotira?.student) {
    const sid = xotira.student.id;
    await db.retrievalRecord.deleteMany({ where: { studentId: sid } });
    await db.intervention.deleteMany({ where: { studentId: sid } });
    await db.recommendation.deleteMany({ where: { studentId: sid } });
    await db.learningEvent.deleteMany({ where: { studentId: sid } });
    await db.attempt.deleteMany({ where: { studentId: sid } });
    await db.learnerKnowledge.deleteMany({ where: { studentId: sid } });
    await db.enrollment.deleteMany({ where: { studentId: sid } });
    await db.assessmentAnswer.deleteMany({ where: { session: { studentId: sid } } });
    await db.cognitiveProfile.deleteMany({ where: { studentId: sid } });
    await db.assessmentSession.deleteMany({ where: { studentId: sid } });
    await db.student.delete({ where: { id: sid } });
    await db.user.delete({ where: { email: "admin@xotira.uz" } });
    console.log("admin@xotira.uz o'chirildi");
  } else if (xotira) {
    await db.user.delete({ where: { email: "admin@xotira.uz" } });
    console.log("admin@xotira.uz o'chirildi (studentsiz)");
  }

  const users = await db.user.findMany({ select: { email: true, role: true } });
  const students = await db.student.count();
  const courses = await db.course.count();
  const content = await db.contentItem.count({ where: { status: "APPROVED" } });
  const questions = await db.question.count();

  console.log("\n=== Joriy holat ===");
  console.log(`Foydalanuvchilar: ${users.length}`);
  console.log(`Talabalar: ${students}`);
  console.log(`Kurslar: ${courses}`);
  console.log(`Materiallar: ${content}`);
  console.log(`Savollar: ${questions}`);
  console.log("\nHisob ma'lumotlari:");
  users.forEach(u => console.log(`  [${u.role}] ${u.email}`));
}

main().catch(console.error).finally(() => db.$disconnect());
