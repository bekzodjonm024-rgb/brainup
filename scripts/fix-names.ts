import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // Professor: Aziz Karimov → Azamat Boydavlatov
  await db.professor.updateMany({
    where: { user: { email: "professor@ndpi.uz" } },
    data: { firstName: "Azamat", lastName: "Boydavlatov" },
  });

  // Admin: → Begzodjon Mamatov
  // Admin faqat User modelida, alohida profil yo'q — avatarUrl va email bor
  // Admin panelida ism ko'rsatish uchun User modeliga firstName/lastName yo'q
  // Lekin admin@ndpi.uz user uchun bitta Student yoki Professor profil ham yo'q
  // Tekshiramiz qanday saqlanadi
  const adminUser = await db.user.findUnique({
    where: { email: "admin@ndpi.uz" },
    include: { student: true, professor: true },
  });
  console.log("Admin user:", JSON.stringify(adminUser, null, 2));

  const prof = await db.professor.findFirst({
    where: { user: { email: "professor@ndpi.uz" } },
  });
  console.log(`\n✓ Professor: ${prof?.firstName} ${prof?.lastName}`);
}

main().catch(console.error).finally(() => db.$disconnect());
