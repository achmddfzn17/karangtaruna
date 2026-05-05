"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X, ZoomIn, Image as ImageIcon } from "lucide-react";

const galeriItems = [
  {
    id: "1",
    title: "Bakti Sosial 2024",
    bgClass: "bg-slate-200",
    span: "col-span-2 row-span-2",
  },
  {
    id: "2",
    title: "Pelatihan Digital",
    bgClass: "bg-slate-200",
    span: "col-span-1 row-span-1",
  },
  {
    id: "3",
    title: "Festival Budaya",
    bgClass: "bg-slate-200",
    span: "col-span-1 row-span-1",
  },
  {
    id: "4",
    title: "Turnamen Olahraga",
    bgClass: "bg-slate-200",
    span: "col-span-1 row-span-2",
  },
  {
    id: "5",
    title: "Penghijauan Lingkungan",
    bgClass: "bg-slate-200",
    span: "col-span-1 row-span-1",
  },
  {
    id: "6",
    title: "Rapat Anggota Tahunan",
    bgClass: "bg-slate-200",
    span: "col-span-1 row-span-1",
  },
];

export default function GaleriSection() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const active = galeriItems.find((g) => g.id === lightbox);

  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Galeri
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 leading-tight">
              Galeri <span className="text-blue-500">Kegiatan</span>
            </h2>
            <p className="text-[15px] md:text-[16px] text-slate-600 mt-2 max-w-lg">
              Momen-momen berharga dari setiap kegiatan dan program yang telah
              kami laksanakan bersama.
            </p>
          </div>
          <Link
            href="/galeri"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Lihat Galeri
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] gap-4">
          {galeriItems.map((item) => (
            <motion.div
              key={item.id}
              className={`${item.span} relative group cursor-pointer rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(item.id)}
            >
              {/* Background block */}
              <div
                className={`absolute inset-0 ${item.bgClass}`}
              />
              <ImageIcon className="w-12 h-12 text-slate-300 z-0 relative" />

              {/* Texture overlay */}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/60 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-blue-950/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-[13px] text-white font-bold">{item.title}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20"
          >
            Lihat Galeri Lengkap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && active && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Tutup lightbox"
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-2xl aspect-video rounded-2xl ${active.bgClass} relative overflow-hidden flex items-center justify-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <ImageIcon className="w-24 h-24 text-slate-300" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-slate-900 font-bold text-sm">{active.title}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
