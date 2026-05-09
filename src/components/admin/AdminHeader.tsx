"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, UserCircle, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  userName: string;
  userRole: string;
  onMenuClick: () => void;
}

export default function AdminHeader({
  userName,
  userRole,
  onMenuClick,
}: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Kiri: hamburger + judul */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">Dashboard Admin</h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Kelola data Karang Taruna
          </p>
        </div>
      </div>

      {/* Kanan: bell + user dropdown */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
        >
          {/* Avatar */}
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          {/* Nama + role — hidden di mobile kecil */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              {roleLabel[userRole] || userRole}
            </p>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {/* Info user */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {roleLabel[userRole] || userRole}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link
                href="/dashboard/profil"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-slate-400" />
                Profil Saya
              </Link>

              <Link
                href="/"
                target="_blank"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Lihat Website
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 py-1.5">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout Akun
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
