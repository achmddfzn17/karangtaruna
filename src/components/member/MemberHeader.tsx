"use client";

import { Bell } from "lucide-react";

interface MemberHeaderProps {
  user: {
    name: string;
    image?: string | null;
  };
}

export default function MemberHeader({ user }: MemberHeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Dashboard</h1>
        <p className="text-[13px] text-slate-500 font-medium">Selamat datang, {user.name}</p>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-blue-600 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">Anggota Aktif</p>
          </div>
          <img
            src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-blue-100 object-cover"
          />
        </div>
      </div>
    </header>
  );
}
