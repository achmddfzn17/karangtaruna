import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Tag } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { JenisKegiatan } from "@prisma/client";

export default async function KegiatanSection() {
  const kegiatanList = await prisma.kegiatan.findMany({
    where: { status: { in: ["UPCOMING", "ONGOING"] } },
    orderBy: { tanggalMulai: "asc" },
    take: 3,
  });

  const jenisLabels: Record<JenisKegiatan, string> = {
    SOSIAL: "Sosial",
    PENDIDIKAN: "Pendidikan",
    EKONOMI: "Ekonomi",
    OLAHRAGA: "Olahraga",
    SENI_BUDAYA: "Seni & Budaya",
    LAINNYA: "Lainnya",
  };

  const jenisColors: Record<JenisKegiatan, string> = {
    SOSIAL: "text-rose-600 bg-white",
    PENDIDIKAN: "text-blue-600 bg-white",
    EKONOMI: "text-emerald-600 bg-white",
    OLAHRAGA: "text-orange-600 bg-white",
    SENI_BUDAYA: "text-amber-600 bg-white",
    LAINNYA: "text-slate-600 bg-white",
  };

  return (
    <section className="py-20 md:py-28 bg-[#f8fbff]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Agenda Kami
              </span>
            </div>
            <h2 className="text-3xl md:text-[44px] font-black text-slate-900 leading-tight tracking-tight">
              Kegiatan <span className="text-blue-600">Terbaru</span>
            </h2>
            <p className="text-[15px] md:text-lg text-slate-500 mt-4 max-w-xl font-medium leading-relaxed">
              Aktivitas dan program terkini yang kami jalankan bersama seluruh
              anggota dan masyarakat untuk kemajuan bersama.
            </p>
          </div>
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all whitespace-nowrap group"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {kegiatanList.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">Belum ada kegiatan mendatang.</p>
            </div>
          ) : (
            kegiatanList.map((k) => (
              <article
                key={k.id}
                className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 group flex flex-col"
              >
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  {k.thumbnail ? (
                    <Image
                      src={k.thumbnail}
                      alt={k.nama}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <Calendar className="w-16 h-16 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${jenisColors[k.jenis]}`}>
                      <Tag className="w-3.5 h-3.5" />
                      {jenisLabels[k.jenis]}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-black text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
                    {k.nama}
                  </h3>
                  <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-2 mb-6 font-medium">
                    {k.deskripsi || "Tidak ada deskripsi tersedia untuk kegiatan ini."}
                  </p>

                  <div className="flex flex-col gap-3 mb-8 mt-auto">
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      {formatDate(k.tanggalMulai)}
                    </div>
                    <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="line-clamp-1">{k.lokasi || "Lokasi menyusul"}</span>
                    </div>
                  </div>

                  <Link
                    href={`/kegiatan`}
                    className="inline-flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-[13px] font-black text-slate-900 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 group/btn"
                  >
                    Selengkapnya
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
