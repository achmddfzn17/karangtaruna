"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Lock,
  Home,
  Info,
  Calendar,
  Newspaper,
  FileText,
  Image as ImageIcon,
  ChevronRight
} from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Tentang", href: "/tentang", icon: Info },
  { label: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { label: "Berita", href: "/berita", icon: Newspaper },
  { label: "Artikel", href: "/artikel", icon: FileText },
  { label: "Galeri", href: "/galeri", icon: ImageIcon },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-full border border-gray-100"
              onError={(e) => {
                // Fallback to a styled div if logo.png doesn't exist
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {/* Fallback Icon */}
            <div className="hidden w-10 h-10 bg-blue-50 text-blue-600 rounded-full items-center justify-center border border-blue-100">
              <span className="font-bold">KT</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[16px] font-extrabold text-slate-900 leading-tight">
                Karang Taruna
              </span>
              <span className="text-[11px] font-bold text-blue-500 leading-tight">
                Generasi Emas
              </span>
            </div>
            <div className="ml-2 hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-600">Online</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link: any) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-bold transition-all ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-slate-700" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Login Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/anggota/login"
              className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
            >
              <Lock className="w-4 h-4" />
              Login Anggota
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-2 py-4 flex flex-col gap-1">
                {navLinks.map((link: any, i: number) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          active
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-slate-700" : "text-slate-400"}`} />
                        {link.label}
                        {active && <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />}
                      </Link>
                    </motion.div>
                  );
                })}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.03 + 0.1 }}
                  className="mt-2 pt-4 border-t border-gray-100 px-2"
                >
                  <Link
                    href="/anggota/login"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Lock className="w-5 h-5" />
                    Login Anggota
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
