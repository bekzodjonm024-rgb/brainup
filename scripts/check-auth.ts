import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { compare, hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const emails = ["professor@ndpi.uz", "admin@ndpi.uz"];
  const passwords = ["professor123", "admin123"];

  for (let i = 0; i < emails.length; i++) {
    const user = await db.user.findUnique({ where: { email: emails[i] } });
    if (!user) { console.log(`${emails[i]}: TOPILMADI`); continue; }

    const match = await compare(passwords[i], user.passwordHash);
    console.log(`${emails[i]}: isActive=${user.isActive}, parol="${passwords[i]}" → ${match ? "✓ TO'G'RI" : "✗ NOTO'G'RI"}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
