import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  // Add column if not exists
  await db.$queryRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`
  );
  console.log("✓ display_name ustuni qo'shildi (yoki allaqachon bor)");

  // Set admin displayName
  await db.$queryRawUnsafe(
    `UPDATE users SET display_name = 'Begzodjon Mamatov' WHERE email = 'admin@ndpi.uz'`
  );
  console.log("✓ Admin: Begzodjon Mamatov");

  // Verify professor name
  const prof = await db.professor.findFirst({
    where: { user: { email: "professor@ndpi.uz" } },
    select: { firstName: true, lastName: true },
  });
  console.log(`✓ Professor: ${prof?.firstName} ${prof?.lastName}`);
}

main().catch(console.error).finally(() => db.$disconnect());
