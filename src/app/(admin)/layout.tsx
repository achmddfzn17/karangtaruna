import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const userName = session.user.name || "Admin";

  async function handleSignOut() {
    "use server";
    const { signOut } = await import("@/auth");
    await signOut();
  }

  return (
    <AdminLayoutClient userName={userName} userRole={userRole} signOutAction={handleSignOut}>
      {children}
    </AdminLayoutClient>
  );
}
