"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface HeroSectionProps {
  statsData: {
    anggota: number;
    kegiatan: number;
    program: number;
  };
}

export default function HeroSection({ statsData }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 bg-white overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 z-10"
          >
            {/* Status badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Organisasi Kepemudaan Indonesia
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-[64px] font-extrabold leading-[1.1] tracking-tight text-slate-900 mt-2">
              Karang Taruna
              <br />
              <span className="text-blue-500">
                Generasi Emas
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-[17px] text-slate-600 leading-relaxed max-w-md mt-2">
              Bersama membangun pemuda yang kreatif, inovatif, dan berprestasi
              untuk Indonesia yang lebih baik
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/tentang"
                className="px-7 py-3 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20"
              >
                Tentang Kami
              </Link>
              <Link
                href="/kegiatan"
                className="px-7 py-3 rounded-lg bg-white border border-blue-100 text-blue-500 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Lihat Kegiatan
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-12 mt-12">
              <div>
                <div className="text-3xl font-extrabold text-blue-500">{statsData.anggota}</div>
                <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-1">Anggota</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-500">{statsData.kegiatan}</div>
                <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-1">Kegiatan</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-500">{statsData.program}</div>
                <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-1">Program</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Image / Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center relative"
          >
            <img 
              src="/hero-logo.png" 
              alt="Karang Taruna Logo" 
              className="w-full max-w-[500px] h-auto object-contain"
              onError={(e) => {
                // Fallback UI if hero-logo.png doesn't exist
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {/* Fallback CSS Circle (Visible only if image fails to load) */}
            <div className="hidden relative w-full max-w-[450px] aspect-square rounded-full items-center justify-center border-[16px] border-blue-600">
              <div className="absolute inset-2 border-4 border-slate-100 rounded-full" />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center rotate-[-30deg]">
                 <span className="text-blue-600 font-extrabold text-3xl uppercase tracking-[1rem] opacity-30">Karang Taruna</span>
              </div>
              <div className="relative w-56 h-56 bg-red-600 rounded-full flex flex-col items-center justify-center border-4 border-yellow-400 shadow-2xl">
                <Shield className="w-24 h-24 text-white mb-2" />
                <span className="text-white font-bold text-xs">Unit 10</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
