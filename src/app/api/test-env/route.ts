import { NextResponse } from "next/server";

/**
 * TEMPORARY DEBUG ENDPOINT
 * Check if environment variables are set correctly in production
 * DELETE THIS FILE AFTER DEBUGGING!
 */
export async function GET() {
  return NextResponse.json({
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET ? "✅ Set" : "❌ Missing",
      AUTH_URL: process.env.AUTH_URL || "❌ Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL || "Not on Vercel",
    },
    timestamp: new Date().toISOString(),
  });
}
