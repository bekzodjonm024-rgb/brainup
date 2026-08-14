import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const DEMO_EMAILS = [
  // Seed faylidagi demo talaba
  "student@ndpi.uz",
  // seed-rich.ts qo'shgan 10 ta soxta talaba
  "azimova@ndpi.uz",
  "tursunov@ndpi.uz",
  "xolmatova@ndpi.uz",
  "normatov@ndpi.uz",
  "karimova@ndpi.uz",
  "ergashev@ndpi.uz",
  "salimova@ndpi.uz",
  "raximov@ndpi.uz",
  "yuldasheva@ndpi.uz",
  "mirzayev@ndpi.uz",
  // seed-rich.ts qo'shgan 2 ta soxta professor
  "yusupova@ndpi.uz",
  "toshmatov@ndpi.uz",
];

async function main() {
  console.log("Soxta foydalanuvchilarni o'chirish...\n");

  for (const email of DEMO_EMAILS) {
    const user = await db.user.findUnique({
      where: { email },
      include: { student: true, professor: true },
    });
    if (!user) { console.log(`  ⏭  ${email} — topilmadi`); continue; }

    if (user.student) {
      const sId = user.student.id;
      // Bog'liq barcha ma'lumotlarni o'chirish
      await db.retrievalRecord.deleteMany({ where: { studentId: sId } });
      await db.intervention.deleteMany({ where: { studentId: sId } });
      await db.recommendation.deleteMany({ where: { studentId: sId } });
      await db.learningEvent.deleteMany({ where: { studentId: sId } });
      await db.attempt.deleteMany({ where: { studentId: sId } });
      await db.learnerKnowledge.deleteMany({ where: { studentId: sId } });
      await db.enrollment.deleteMany({ where: { studentId: sId } });
      await db.assessmentAnswer.deleteMany({
        where: { session: { studentId: sId } },
      });
      await db.cognitiveProfile.deleteMany({ where: { studentId: sId } });
      await db.assessmentSession.deleteMany({ where: { studentId: sId } });
      await db.student.delete({ where: { id: sId } });
    }

    if (user.professor) {
      // Professorning kurslarini boshqa professorga o'tkazmasdan o'chirish shart emas
      // Faqat professor profilini o'chirish (kurslar qolsin, lekin professorId null bo'ladi)
      // Aslida FK constraint bor — kurslarni ham o'chirish kerak yoki saqlash
      // Bu holda yusupova va toshmatov kurslarni professor@ndpi.uz ga o'tkazamiz
      const mainProf = await db.professor.findFirst({
        where: { user: { email: "professor@ndpi.uz" } },
      });
      if (mainProf) {
        await db.course.updateMany({
          where: { professorId: user.professor.id },
          data: { professorId: mainProf.id },
        });
      }
      await db.professor.delete({ where: { id: user.professor.id } });
    }

    await db.user.delete({ where: { email } });
    console.log(`  ✓  ${email} — o'chirildi`);
  }

  // Natija
  const students = await db.student.count();
  const professors = await db.professor.count();
  const users = await db.user.count();
  const courses = await db.course.count();
  const content = await db.contentItem.count();
  const questions = await db.question.count();

  console.log("\n═══════════════════════════════════");
  console.log("        O'CHIRISH YAKUNLANDI");
  console.log("═══════════════════════════════════");
  console.log(`👤 Foydalanuvchilar: ${users}`);
  console.log(`👥 Talabalar:        ${students}`);
  console.log(`🎓 Professorlar:     ${professors}`);
  console.log(`📚 Kurslar:          ${courses} (saqlanib qoldi)`);
  console.log(`📄 Materiallar:      ${content} (saqlanib qoldi)`);
  console.log(`❓ Savollar:         ${questions} (saqlanib qoldi)`);
  console.log("\nQolgan hisob ma'lumotlari:");
  const remaining = await db.user.findMany({ select: { email: true, role: true } });
  for (const u of remaining) console.log(`  ${u.role}: ${u.email}`);
}

main().catch(console.error).finally(() => db.$disconnect());
