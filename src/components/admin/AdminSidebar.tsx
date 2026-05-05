"use client";

import { useState } from "react";
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
  Image as ImageIcon,
  ClipboardList,
  UserCog,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  { label: "Kuisioner SUS", href: "/dashboard/sus", icon: ClipboardList },
  { label: "Kelola Admin", href: "/dashboard/kelola-admin", icon: UserCog },
];

interface AdminSidebarProps {
  userName: string;
  signOutAction: () => Promise<void>;
}

export default function AdminSidebar({ userName, signOutAction }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "flex items-center gap-3 h-[72px] px-4 border-b border-gray-100 shrink-0",
        collapsed && "justify-center px-2"
      )}>
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-10 object-contain rounded-full shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-slate-900 leading-tight truncate">
              Admin Panel
            </span>
            <span className="text-[11px] text-slate-400 font-medium leading-tight truncate">
              Karang Taruna
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200",
                collapsed && "justify-center px-2",
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-white" : "text-slate-400")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-1 shrink-0">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "Lihat Website" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <ExternalLink className="w-[18px] h-[18px] shrink-0 text-slate-400" />
          {!collapsed && <span>Lihat Website</span>}
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </form>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[82px] -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
        )}
      </button>
    </aside>
  );
}
