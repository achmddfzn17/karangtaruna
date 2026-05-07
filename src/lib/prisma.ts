import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  // During build time on Vercel, DATABASE_URL might not be available
  // We need to provide a dummy connection string for build to succeed
  if (!connectionString) {
    console.warn("⚠️  DATABASE_URL not set, using placeholder for build");
    
    // Use a dummy connection string for build time
    // This won't actually connect to any database during build
    const dummyConnectionString = "postgresql://user:pass@localhost:5432/db";
    const pool = new Pool({ connectionString: dummyConnectionString });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({
      adapter,
      log: [],
    });
  }
  
  // Production runtime with real DATABASE_URL
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
