import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import authConfig from "./auth.config";
import { logger as fileLogger } from "@/lib/logger";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["ADMIN", "ANGGOTA"]).optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      /**
       * Returning `null` is the idiomatic Auth.js way to reject a login.
       * It avoids printing a stack trace in dev (which `throw new CredentialsSignin()`
       * does under Next.js Turbopack) while still giving the client a
       * `CredentialsSignin` error code in the `signIn(...)` response.
       */
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          fileLogger.warn("auth", "Login rejected: invalid payload");
          return null;
        }

        const { email, password, role } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) {
          fileLogger.warn("auth", "Login failed: user not found or no password set", { email });
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          fileLogger.warn("auth", "Login failed: wrong password", { email });
          return null;
        }

        // Role gate: prevent admins from using the anggota login form and vice versa.
        if (role === "ADMIN" && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          fileLogger.warn("auth", "Login blocked: role mismatch on admin form", {
            email,
            userRole: user.role,
          });
          return null;
        }
        if (role === "ANGGOTA" && user.role !== "ANGGOTA") {
          fileLogger.warn("auth", "Login blocked: role mismatch on anggota form", {
            email,
            userRole: user.role,
          });
          return null;
        }

        fileLogger.info("auth", "Login success", {
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  // CredentialsSignin is the expected response for a wrong password and does
  // not need to be printed as an error stack trace in the dev terminal.
  // All other auth errors are persisted to logs/error-YYYY-MM-DD.log.
  logger: {
    error(error) {
      if (error?.name === "CredentialsSignin") return;
      fileLogger.error("auth", error?.message ?? "Auth error", error);
    },
    warn(code) {
      fileLogger.warn("auth", String(code));
    },
    debug() {
      // no-op
    },
  },
});
