const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success:", user);
  } catch (e) {
    console.error("Full Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
