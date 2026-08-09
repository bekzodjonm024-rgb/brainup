import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@ndpi.uz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-immediately";

async function main() {
  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    if (existing.role === "ADMIN") {
      console.log(`✓ Admin allaqachon mavjud: ${ADMIN_EMAIL}`);
    } else {
      await db.user.update({ where: { email: ADMIN_EMAIL }, data: { role: "ADMIN" } });
      console.log(`✓ ${ADMIN_EMAIL} ADMIN roliga o'tkazildi`);
    }
    return;
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await db.user.create({
    data: { email: ADMIN_EMAIL, passwordHash, role: "ADMIN" },
  });

  console.log(`✓ Admin yaratildi:`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Parol:    ${ADMIN_PASSWORD}`);
  console.log(`  ⚠️  Parolni darhol o'zgartiring!`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
