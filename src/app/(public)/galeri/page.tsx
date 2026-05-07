"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ZoomIn,
  X,
  Image as ImageIcon,
  Video,
  Grid3X3,
  Loader2,
} from "lucide-react";

interface GaleriItem {
  id: string;
  judul: string;
  url: string;
  type: "FOTO" | "VIDEO";
  deskripsi: string | null;
  kegiatan: { nama: string } | null;
  createdAt: string;
}

type FilterType = "ALL" | "FOTO" | "VIDEO";

// Pola span untuk masonry grid — berulang setiap 6 item
const spanPattern = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

export default function GaleriPage() {
  const [items, setItems] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/galeri/public")
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? items : items.filter((g) => g.type === filter);
  const activeIdx = filtered.findIndex((g) => g.id === lightbox);
  const active = filtered[activeIdx] ?? null;

  const fotoCount = items.filter((g) => g.type === "FOTO").length;
  const videoCount = items.filter((g) => g.type === "VIDEO").length;

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-500 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Galeri</span>
          </nav>
          <h1 className="text-4xl md:text-[56px] font-extrabold text-slate-900 mb-6 leading-[1.1]">
            Galeri <span className="text-blue-500">Kegiatan</span>
          </h1>
          <p className="text-[16px] text-slate-600 max-w-xl leading-relaxed">
            Dokumentasi foto dan video dari seluruh kegiatan dan program yang telah kami laksanakan.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            {(
              [
                { value: "ALL", label: "Semua", icon: Grid3X3, count: items.length },
                { value: "FOTO", label: "Foto", icon: ImageIcon, count: fotoCount },
                { value: "VIDEO", label: "Video", icon: Video, count: videoCount },
              ] as const
            ).map(({ value, label, icon: Icon, count }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all border ${
                  filter === value
                    ? "bg-blue-500 text-white border-transparent shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                  filter === value ? "bg-white text-blue-600" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada dokumentasi</h3>
              <p className="text-[15px] text-slate-500">
                {filter !== "ALL" ? "Coba filter yang berbeda." : "Dokumentasi akan segera ditambahkan."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] gap-4"
              >
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={`${spanPattern[i % 6]} relative group cursor-pointer rounded-2xl overflow-hidden bg-slate-100`}
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
                        <Video className="w-12 h-12 text-white/30" />
                      </div>
                    )}

                    {item.type === "VIDEO" && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="flex items-center gap-1 bg-white shadow-sm text-red-500 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide">
                          <Video className="w-3 h-3" /> VIDEO
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 z-10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 delay-100">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="relative z-10 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                        <p className="text-white text-[15px] font-bold line-clamp-2 mb-1.5 leading-snug">{item.judul}</p>
                        {item.kegiatan && (
                          <p className="text-blue-100 text-[11px] font-bold uppercase tracking-wide">{item.kegiatan.nama}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              aria-label="Tutup lightbox"
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              onClick={() => setLightbox(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full aspect-video rounded-3xl bg-slate-800 relative overflow-hidden flex items-center justify-center shadow-2xl">
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

              <div className="mt-6 bg-white rounded-2xl p-6 flex items-start justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="text-slate-900 font-extrabold text-xl mb-1.5">{active.judul}</h3>
                  {active.kegiatan && (
                    <p className="text-slate-500 font-bold text-[13px] uppercase tracking-wide">{active.kegiatan.nama}</p>
                  )}
                  {active.deskripsi && (
                    <p className="text-slate-600 text-sm mt-2">{active.deskripsi}</p>
                  )}
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-[11px] font-extrabold px-4 py-2 rounded-full uppercase tracking-wide ${
                  active.type === "VIDEO" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                }`}>
                  {active.type === "VIDEO" ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  {active.type}
                </span>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={(e) => { e.stopPropagation(); if (activeIdx > 0) setLightbox(filtered[activeIdx - 1].id); }}
                  disabled={activeIdx === 0}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Sebelumnya
                </button>
                <span className="text-white font-bold text-[14px] bg-white/10 px-4 py-2 rounded-xl">
                  {activeIdx + 1} / {filtered.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); if (activeIdx < filtered.length - 1) setLightbox(filtered[activeIdx + 1].id); }}
                  disabled={activeIdx === filtered.length - 1}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
