import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  // During build time on Vercel, DATABASE_URL might not be available yet
  // This is okay because the client won't actually be used during build
  if (!connectionString) {
    // Only throw error in runtime (not during build)
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      console.warn("DATABASE_URL not set, creating Prisma client without adapter");
    }
    // Return basic Prisma client without adapter for build time
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  
  // Production runtime with DATABASE_URL available
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
