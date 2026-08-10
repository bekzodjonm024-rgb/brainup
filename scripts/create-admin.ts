import "dotenv/config";
import { db } from "../src/lib/db/index";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await db.user.findUnique({ where: { email: "admin@ndpi.uz" } });
  if (existing) {
    console.log("Admin allaqachon mavjud:", existing.email, existing.role);
    return;
  }
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await db.user.create({
    data: { email: "admin@ndpi.uz", passwordHash: hash, role: "ADMIN" },
  });
  console.log("Admin yaratildi:", admin.email);
}

main().finally(() => db.$disconnect());
