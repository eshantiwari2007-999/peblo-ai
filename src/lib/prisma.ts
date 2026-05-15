/**
 * Prisma v7 Connection Setup
 *
 * Prisma v7 no longer supports url/directUrl in schema.prisma or datasourceUrl
 * in the PrismaClient constructor. Instead, a Driver Adapter must be used.
 *
 * This module sets up the PrismaClient with the @prisma/adapter-pg driver adapter
 * using DIRECT_DATABASE_URL (standard postgresql://) for the runtime connection.
 * DATABASE_URL (which may be prisma+postgres://) is used only for migrations.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Use DIRECT_DATABASE_URL for standard postgres:// connection (required for Driver Adapter)
  // Fall back to DATABASE_URL if it's a standard postgres:// URL
  const connectionString =
    process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
