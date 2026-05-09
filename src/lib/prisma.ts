import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client singleton pattern
 * Prevents multiple instances in development mode
 * Reference: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-monorepo
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please check your .env.local file or environment configuration."
    );
  }

  const pool = new Pool({ 
    connectionString,
    // Optional: configure pool for better performance
    max: 20, // Max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);

  const logLevel = process.env.NODE_ENV === "development" 
    ? (["warn", "error"] as const)
    : (["error"] as const);

  return new PrismaClient({
    adapter,
    log: [...logLevel],
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Ensure we only have one Prisma instance in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;
