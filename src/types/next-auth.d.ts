import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "./index";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: Role;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
