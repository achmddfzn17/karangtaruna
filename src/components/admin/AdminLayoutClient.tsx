"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutClientProps {
  userName: string;
  userRole: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  userName,
  userRole,
  signOutAction,
  children,
}: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminSidebar
        userName={userName}
        userRole={userRole}
        signOutAction={signOutAction}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="lg:ml-[260px] transition-all duration-300 flex flex-col min-h-screen">
        <AdminHeader
          userName={userName}
          userRole={userRole}
          onMenuClick={() => setMobileOpen(true)}
          signOutAction={signOutAction}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
