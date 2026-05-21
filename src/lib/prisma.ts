import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Prisma Client singleton with **lazy** initialization.
 *
 * Why lazy?
 * ---------
 * Next.js evaluates route modules during `next build` (the "Collecting page
 * data" phase). If we constructed the Prisma client at module top-level, a
 * missing `DATABASE_URL` would crash the build even for routes that never run
 * a query during build. The Proxy below defers `createPrismaClient()` until
 * the first property access (e.g. `prisma.user.findUnique(...)`), so build
 * succeeds as long as the env var exists at request time.
 *
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
    statement_timeout: 30000, // Abort any statement that takes more than 30s
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

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createPrismaClient();
  // Reuse the singleton in dev (HMR) and in serverless containers between
  // warm invocations. Construction cost is non-trivial.
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Proxy stub: zero-cost at module load. The real client is created on first
 * property access (e.g. `prisma.user`, `prisma.$transaction(...)`).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
