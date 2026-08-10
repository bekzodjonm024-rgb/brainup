import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) throw new Error("DATABASE_URL not set");

  const adapter = new PrismaPg({ connectionString });
  const db = new PrismaClient({ adapter });

  const result = await db.university.updateMany({
    where: { shortName: "NDPI" },
    data: { shortName: "NamDPI" },
  });

  console.log(`Updated ${result.count} university record(s): NDPI → NamDPI`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
