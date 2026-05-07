"use client";

import { Menu } from "lucide-react";

interface MemberHeaderProps {
  user: {
    name: string;
    image?: string | null;
  };
  onMenuClick: () => void;
}

export default function MemberHeader({ user, onMenuClick }: MemberHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">Portal Anggota</h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Selamat datang, {user.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
          <p className="text-[11px] text-blue-500 font-bold">Anggota Aktif</p>
        </div>
        <img
          src={
            user.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=80`
          }
          alt={user.name}
          className="w-9 h-9 rounded-full border-2 border-blue-100 object-cover shrink-0"
        />
      </div>
    </header>
  );
}
