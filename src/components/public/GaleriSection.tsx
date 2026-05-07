"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X, ZoomIn, Image as ImageIcon, Video } from "lucide-react";

interface GaleriItem {
  id: string;
  judul: string;
  url: string;
  type: "FOTO" | "VIDEO";
  deskripsi: string | null;
  kegiatan: { nama: string } | null;
}

const spanMap = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1"];

interface Props {
  items: GaleriItem[];
}

export default function GaleriSection({ items }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const active = items.find((g) => g.id === lightbox);

  if (items.length === 0) return null;

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
          {items.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id}
              className={`${spanMap[i] ?? "col-span-1 row-span-1"} relative group cursor-pointer rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-100`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(item.id)}
            >
              {item.type === "FOTO" ? (
                <img
                  src={item.url}
                  alt={item.judul}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  <Video className="w-10 h-10 text-white/40" />
                </div>
              )}

              {/* Video badge */}
              {item.type === "VIDEO" && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="flex items-center gap-1 bg-white shadow-sm text-red-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    <Video className="w-3 h-3" /> VIDEO
                  </span>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/60 transition-all duration-300 flex items-center justify-center z-10">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-blue-950/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                <p className="text-[13px] text-white font-bold line-clamp-1">{item.judul}</p>
                {item.kegiatan && (
                  <p className="text-[10px] text-blue-200 font-medium mt-0.5">{item.kegiatan.nama}</p>
                )}
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
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 relative flex items-center justify-center shadow-2xl">
              {active.type === "FOTO" ? (
                <img src={active.url} alt={active.judul} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/60">
                  <Video className="w-16 h-16" />
                  <p className="text-sm font-medium">Video tidak dapat diputar langsung</p>
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-bold transition-colors"
                  >
                    Buka Video →
                  </a>
                </div>
              )}
            </div>
            <div className="mt-4 bg-white rounded-2xl p-5 shadow-xl">
              <h3 className="text-slate-900 font-extrabold text-lg">{active.judul}</h3>
              {active.kegiatan && (
                <p className="text-slate-500 text-sm font-medium mt-1">{active.kegiatan.nama}</p>
              )}
              {active.deskripsi && (
                <p className="text-slate-600 text-sm mt-2">{active.deskripsi}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
