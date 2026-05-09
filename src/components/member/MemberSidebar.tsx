"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Clock,
  Wallet,
  MessageSquare,
  Vote as VoteIcon,
  Bell,
  Newspaper,
  BookOpen,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  CreditCard,
  Award,
  Layers,
  X,
  ChevronDown,
  Info,
  Zap,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface MenuGroup {
  label: string;
  icon: React.ElementType;
  items: NavLink[];
  defaultOpen?: boolean;
}

const getMenuGroups = (unreadCount: number): MenuGroup[] => [
  {
    label: "Dashboard",
    icon: Home,
    items: [{ href: "/member/dashboard", label: "Dashboard", icon: Home }],
    defaultOpen: true,
  },
  {
    label: "Informasi",
    icon: Info,
    items: [
      { href: "/member/notifikasi", label: "Notifikasi", icon: Bell, badge: unreadCount },
      { href: "/member/kalender", label: "Kalender Kegiatan", icon: CalendarIcon },
      { href: "/member/kegiatan", label: "Riwayat Kegiatan", icon: Clock },
    ],
  },
  {
    label: "Konten",
    icon: BookOpen,
    items: [
      { href: "/member/berita", label: "Berita", icon: Newspaper },
      { href: "/member/artikel", label: "Artikel", icon: BookOpen },
      { href: "/member/galeri", label: "Galeri Kegiatan", icon: ImageIcon },
      { href: "/member/program", label: "Program Kerja", icon: Layers },
    ],
  },
  {
    label: "Keuangan",
    icon: Wallet,
    items: [
      { href: "/member/keuangan", label: "Transparansi Keuangan", icon: Wallet },
      { href: "/member/iuran", label: "Iuran Anggota", icon: CreditCard },
    ],
  },
  {
    label: "Engagement",
    icon: Zap,
    items: [
      { href: "/member/sertifikat", label: "Sertifikat Digital", icon: Award },
      { href: "/member/aspirasi", label: "Papan Aspirasi", icon: MessageSquare },
      { href: "/member/voting", label: "E-Voting", icon: VoteIcon },
    ],
  },
];

interface MemberSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  unreadCount?: number;
}

export default function MemberSidebar({
  mobileOpen = false,
  onMobileClose,
  unreadCount = 0,
}: MemberSidebarProps) {
  const pathname = usePathname();
  const menuGroups = getMenuGroups(unreadCount);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(menuGroups.filter((g) => g.defaultOpen).map((g) => g.label))
  );

  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-expand group if active item is in it
  useEffect(() => {
    for (const group of menuGroups) {
      if (group.items.some((item) => item.href === pathname)) {
        setExpandedGroups((prev) => new Set(prev).add(group.label));
      }
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = (href: string) => pathname === href;

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel);
      } else {
        newSet.add(groupLabel);
      }
      return newSet;
    });
  };

  const NavItemComponent = ({ link }: { link: NavLink }) => {
    const active = isActive(link.href);
    const Icon = link.icon;
    return (
      <Link
        href={link.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group",
          active
            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        )}
      >
        <Icon
          className={cn(
            "w-[16px] h-[16px] shrink-0",
            active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
          )}
        />
        <span className="truncate flex-1">{link.label}</span>
        {link.badge && link.badge > 0 && (
          <span
            className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0",
              active ? "bg-white/20 text-white" : "bg-red-500 text-white"
            )}
          >
            {link.badge > 99 ? "99+" : link.badge}
          </span>
        )}
      </Link>
    );
  };

  const MenuGroupComponent = ({ group }: { group: MenuGroup }) => {
    const isExpanded = expandedGroups.has(group.label);
    const GroupIcon = group.icon;

    // Single item groups (like Dashboard) don't need expand/collapse
    if (group.items.length === 1) {
      return <NavItemComponent link={group.items[0]} />;
    }

    return (
      <div className="space-y-0.5">
        {/* Group header button */}
        <button
          onClick={() => toggleGroup(group.label)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          <GroupIcon className="w-[16px] h-[16px] shrink-0 text-slate-400 group-hover:text-slate-600" />
          <span className="truncate flex-1 text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {/* Group items */}
        {isExpanded && (
          <div className="pl-2 space-y-0.5 border-l border-slate-200 ml-3">
            {group.items.map((item) => (
              <NavItemComponent key={item.href} link={item} />
            ))}
          </div>
        )}
      </div>
    );
  };

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
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuGroups.map((group) => (
          <MenuGroupComponent key={group.label} group={group} />
        ))}
      </nav>
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
