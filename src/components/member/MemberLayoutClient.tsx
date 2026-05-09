"use client";

import { useState } from "react";
import MemberSidebar from "./MemberSidebar";
import MemberHeader from "./MemberHeader";

interface MemberLayoutClientProps {
  user: { name: string; image?: string | null };
  unreadCount: number;
  children: React.ReactNode;
}

export default function MemberLayoutClient({ user, unreadCount, children }: MemberLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <MemberSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <MemberHeader
          user={user}
          unreadCount={unreadCount}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
