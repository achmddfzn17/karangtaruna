import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Tag } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function KegiatanSection() {
  const kegiatanList = await prisma.kegiatan.findMany({
    where: { status: { in: ["UPCOMING", "ONGOING"] } },
    orderBy: { tanggalMulai: "asc" },
    take: 3,
  });
  return (
    <section className="py-20 md:py-28 bg-[#f4f9ff]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Kegiatan
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 leading-tight">
              Kegiatan <span className="text-blue-500">Terbaru</span>
            </h2>
            <p className="text-[15px] md:text-[16px] text-slate-600 mt-2 max-w-lg">
              Aktivitas dan program terkini yang kami jalankan bersama seluruh
              anggota dan masyarakat.
            </p>
          </div>
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kegiatanList.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center">Belum ada kegiatan mendatang.</p>
          ) : (
            kegiatanList.map((k: any) => {
              const jenisLabels: Record<string, string> = {
                SOSIAL: "Sosial",
                PENDIDIKAN: "Pendidikan",
                EKONOMI: "Ekonomi",
                OLAHRAGA: "Olahraga",
                SENI_BUDAYA: "Seni & Budaya",
                LAINNYA: "Lainnya",
              };
              const jenisColors: Record<string, string> = {
                SOSIAL: "text-red-700 bg-white",
                PENDIDIKAN: "text-purple-700 bg-white",
                EKONOMI: "text-blue-700 bg-white",
                OLAHRAGA: "text-green-700 bg-white",
                SENI_BUDAYA: "text-amber-700 bg-white",
                LAINNYA: "text-gray-700 bg-white",
              };

              return (
                <article
                  key={k.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-50/50 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Calendar className="w-12 h-12 text-slate-300" />
                    <div className="absolute bottom-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-sm ${jenisColors[k.jenis]}`}>
                        <Tag className="w-3 h-3" />
                        {jenisLabels[k.jenis] || k.jenis}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {k.nama}
                    </h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2 mb-5">
                      {k.deskripsi || "Tidak ada deskripsi"}
                    </p>

                    <div className="flex flex-col gap-2 mb-5 mt-auto">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {formatDate(k.tanggalMulai)}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {k.lokasi || "-"}
                      </div>
                    </div>

                    <Link
                      href={`/kegiatan`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all mt-auto"
                    >
                      Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
