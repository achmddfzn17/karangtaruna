import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

/**
 * Module augmentation for NextAuth types
 * Extends default User and Session types with custom fields
 * 
 * This allows TypeScript to recognize our custom role field
 * without needing to cast to 'any' everywhere
 */
declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession()`, `getSession()` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `auth()`, when using JWT sessions
   */
  interface JWT {
    id: string;
    role: Role;
  }
}
