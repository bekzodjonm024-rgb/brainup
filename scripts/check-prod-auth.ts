import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { compare, hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const checks = [
    { email: "professor@ndpi.uz", pw: "professor123" },
    { email: "admin@ndpi.uz", pw: "admin123" },
  ];

  for (const c of checks) {
    const u = await db.$queryRawUnsafe<any[]>(
      `SELECT email, role, is_active, password_hash FROM users WHERE email = $1`,
      c.email
    );
    if (!u.length) { console.log(`${c.email}: TOPILMADI`); continue; }
    const user = u[0];
    const ok = await compare(c.pw, user.password_hash);
    console.log(`${c.email} [${user.role}] isActive=${user.is_active} parol="${c.pw}" → ${ok ? "TO'G'RI ✓" : "NOTO'G'RI ✗"}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
