import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import { Pool } from "pg";

// Re-export types from Prisma for convenience
export type { Role };

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
    // During `next build` on Vercel the DATABASE_URL env-var is typically not
    // available.  Instead of crashing the build we return a no-op Proxy that
    // satisfies type checks (e.g. PrismaAdapter inspecting model metadata)
    // without ever touching the database.  Any *actual* query at runtime would
    // still fail, but that's fine — at runtime the env var is always set.
    console.warn(
      "[prisma] DATABASE_URL is not set – returning build-safe stub. " +
      "Queries will fail until the variable is provided at runtime."
    );

    // Return a recursive no-op Proxy that acts like a PrismaClient.
    // Any property access returns another Proxy, any function call returns
    // a resolved Promise with null/empty results.  This is enough for
    // PrismaAdapter() and auth.ts module evaluation during build.
    const handler: ProxyHandler<object> = {
      get(_target, prop) {
        if (prop === "isBuildStub") return true;
        // Support common inspection properties
        if (prop === "then") return undefined; // prevent auto-await
        if (prop === Symbol.toPrimitive) return () => "PrismaClient(build-stub)";
        if (prop === Symbol.toStringTag) return "PrismaClient";
        if (prop === "$connect" || prop === "$disconnect") {
          return () => Promise.resolve();
        }
        if (prop === "$on" || prop === "$use") {
          return () => {};
        }
        // For model access (e.g. prisma.user) return another proxy
        // that stubs query methods (findUnique, create, etc.)
        return new Proxy(() => Promise.resolve(null), handler);
      },
      apply() {
        return Promise.resolve(null);
      },
    };

    return new Proxy({}, handler) as unknown as PrismaClient;
  }

  const pool = new Pool({
    connectionString,
    // Serverless-friendly connection pool configuration
    max: 2, // Max connections per serverless function instance
    min: 0, // Allow idle connections to close completely
    idleTimeoutMillis: 5000, // Close idle connections quickly (5s) to free up DB pool
    connectionTimeoutMillis: 10000, // Wait up to 10s for connection
    statement_timeout: 30000, // Abort any statement that takes more than 30s
    query_timeout: 30000, // Abort the query after 30s
    // TCP keepalive prevents Supabase pgbouncer / load-balancer from silently
    // dropping a socket that the local pool still thinks is healthy. Without
    // this you periodically get "Can't reach database server" on the first
    // query after an idle period in dev.
    keepAlive: true,
  });

  // Surface socket-level pool errors instead of letting them resurface as
  // generic "Can't reach database server" the next time a query is attempted.
  pool.on("error", (err) => {
    console.error("[PRISMA_POOL_ERROR]", err.message);
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
    const buildStubClient = client as PrismaClient & { isBuildStub?: boolean };
    if (buildStubClient.isBuildStub) {
      return Reflect.get(client, prop, receiver);
    }
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;

