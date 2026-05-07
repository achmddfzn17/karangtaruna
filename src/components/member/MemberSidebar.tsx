"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  User,
  Clock,
  Wallet,
  MessageSquare,
  Vote as VoteIcon,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navLinks = [
  { href: "/member/dashboard", label: "Dashboard", icon: Home },
  { href: "/member/profile", label: "Profil Saya", icon: User },
  { href: "/member/kegiatan", label: "Riwayat Kegiatan", icon: Clock },
  { href: "/member/keuangan", label: "Transparansi Keuangan", icon: Wallet },
  { href: "/member/aspirasi", label: "Papan Aspirasi", icon: MessageSquare },
  { href: "/member/voting", label: "E-Voting", icon: VoteIcon },
];

interface MemberSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function MemberSidebar({
  mobileOpen = false,
  onMobileClose,
}: MemberSidebarProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 h-[72px] px-5 border-b border-slate-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-6 h-6 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-extrabold text-slate-900 leading-tight truncate">
            Portal Anggota
          </h2>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider leading-tight">
            Generasi Emas
          </p>
        </div>
        {/* Close — mobile only */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Menu
        </p>
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 group",
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={cn(
                  "w-[17px] h-[17px] shrink-0",
                  active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-0.5 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <ExternalLink className="w-[17px] h-[17px] shrink-0 text-slate-400" />
          <span>Lihat Website</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/anggota/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[240px] shrink-0 bg-white border-r border-slate-100 h-screen sticky top-0 flex-col shadow-sm z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-slate-100 flex flex-col z-50 shadow-xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
