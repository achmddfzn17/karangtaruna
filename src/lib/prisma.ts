import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

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
    // Connection pool optimization
    max: 20, // Max connections in pool
    min: 2, // Maintain minimum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Wait up to 10s for connection
    statementTimeoutMillis: 30000, // Statement timeout 30s
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
