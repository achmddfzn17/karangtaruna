"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
  Newspaper,
  FileText,
  Wallet,
  ImageIcon,
  ClipboardList,
  MessageSquare,
  Vote as VoteIcon,
  UserCog,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Data Anggota", href: "/dashboard/anggota", icon: Users },
  { label: "Data Kegiatan", href: "/dashboard/kegiatan", icon: Calendar },
  { label: "Data Program", href: "/dashboard/program", icon: Layers },
  { label: "Data Berita", href: "/dashboard/berita", icon: Newspaper },
  { label: "Data Artikel", href: "/dashboard/artikel", icon: FileText },
  { label: "Keuangan", href: "/dashboard/keuangan", icon: Wallet },
  { label: "Galeri", href: "/dashboard/galeri", icon: ImageIcon },
  { label: "Aspirasi", href: "/dashboard/aspirasi", icon: MessageSquare },
  { label: "E-Voting", href: "/dashboard/voting", icon: VoteIcon },
  { label: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell },
  { label: "Kuisioner SUS", href: "/dashboard/sus", icon: ClipboardList },
  { label: "Kelola Admin", href: "/dashboard/kelola-admin", icon: UserCog },
  { label: "Log Aktivitas", href: "/dashboard/log", icon: Activity, superAdminOnly: true },
];

interface AdminSidebarProps {
  userName: string;
  userRole: string;
  signOutAction?: () => Promise<void>; // tidak dipakai lagi, tetap di props untuk kompatibilitas
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  userName,
  userRole,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo Header */}
      <div
        className={cn(
          "flex items-center gap-3 h-[72px] px-5 border-b border-slate-100 shrink-0",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-6 h-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[14px] font-extrabold text-slate-900 leading-tight truncate">
              Admin Panel
            </span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider leading-tight truncate">
              Generasi Emas
            </span>
          </div>
        )}
        {/* Close button — mobile only */}
        {!collapsed && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {!collapsed && (
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Menu Utama
          </p>
        )}
        {navItems.map((item) => {
          if ((item as any).superAdminOnly && userRole !== "SUPER_ADMIN") return null;
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 group",
                collapsed && "justify-center px-2",
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={cn(
                  "w-[17px] h-[17px] shrink-0",
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: hanya collapse toggle info */}
      <div className="border-t border-slate-100 px-3 py-3 shrink-0">
        {!collapsed && (
          <p className="text-[10px] text-slate-400 font-medium text-center px-2">
            Profil &amp; Logout tersedia di header ↑
          </p>
        )}
      </div>

      {/* Collapse Toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute top-[80px] -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all z-50 text-slate-400"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex-col z-40 transition-all duration-300 shadow-sm",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-100 flex flex-col z-50 shadow-xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
