import type { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const userName = session.user.name || "Admin";

  async function handleSignOut() {
    "use server";
    const { signOut } = await import("@/auth");
    await signOut();
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminSidebar userName={userName} signOutAction={handleSignOut} />

      {/* Main Content Area */}
      <div className="ml-[260px] transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Dashboard Admin</h2>
            <p className="text-xs text-slate-400 font-medium">Kelola data Karang Taruna</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-[11px] text-slate-400 font-medium">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
