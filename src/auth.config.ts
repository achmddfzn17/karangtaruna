import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(1, "Password harus diisi"),
  role: z.enum(["ADMIN", "ANGGOTA"]).optional(),
});

/**
 * Edge-compatible auth config (no Prisma/Node.js imports).
 * Used by middleware and as the base for the full auth config.
 * 
 * Note: The actual credential verification happens in auth.ts using PrismaAdapter
 * This config provides the session/JWT setup and pages configuration.
 */
export default {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      // IMPORTANT: This authorize function is overridden in the full auth.ts config
      // It must return null here to defer to auth.ts for actual validation
      async authorize() {
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On sign in, add user properties to token
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      
      // Refresh token on signin for OAuth providers
      if (account?.provider !== "credentials") {
        token.accessToken = account?.access_token;
        token.refreshToken = account?.refresh_token;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add JWT claims to session
      if (token && session.user) {
        // token.role is a string at runtime; cast to any to satisfy TS Role type
        session.user.role = token.role as any;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;
