"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Clock, ExternalLink, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { href: "/member/dashboard", label: "Dashboard", icon: Home },
  { href: "/member/profile", label: "Profile Saya", icon: User },
  { href: "/member/kegiatan", label: "Riwayat Kegiatan", icon: Clock },
];

export default function MemberSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col shadow-sm z-50">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-50">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium">Anggota</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4 mx-4" />

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Lihat Website
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/anggota/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
