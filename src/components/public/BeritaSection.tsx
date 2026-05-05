import Link from "next/link";
import { Calendar, ArrowRight, Tag, Newspaper } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function BeritaSection() {
  const beritaList = await prisma.berita.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  const featured = beritaList[0];
  const others = beritaList.slice(1);
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Berita
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 leading-tight">
              Berita <span className="text-blue-500">Terbaru</span>
            </h2>
            <p className="text-[15px] md:text-[16px] text-slate-600 mt-2 max-w-lg">
              Informasi terkini seputar kegiatan, pencapaian, dan program
              Karang Taruna Generasi Emas.
            </p>
          </div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Layout: Featured + Side */}
        {beritaList.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Belum ada berita yang dipublikasikan.</p>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Featured (large card) */}
            <article className="lg:col-span-3 group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="h-56 md:h-72 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-50/50 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Newspaper className="w-16 h-16 text-slate-300" />
                
                <div className="absolute inset-0 flex items-end p-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-600 text-white">
                    <Tag className="w-3 h-3" />
                    {featured?.kategori || "Umum"}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-4">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {featured?.publishedAt ? formatDate(featured.publishedAt) : ""}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                  {featured?.judul}
                </h3>
                <p className="text-[13px] md:text-[14px] text-slate-600 leading-relaxed line-clamp-3 flex-1">
                  {featured?.ringkasan || "Baca berita selengkapnya..."}
                </p>
                <Link
                  href={`/berita/${featured?.id}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all mt-6"
                >
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* Other news cards */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {others.map((b: any) => (
                <article
                  key={b.id}
                  className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex gap-4 h-[120px]"
                >
                  {/* Thumbnail */}
                  <div className="w-32 shrink-0 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50/50 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Newspaper className="w-8 h-8 text-slate-300" />
                  </div>
                  {/* Content */}
                  <div className="p-4 flex flex-col justify-center min-w-0 pr-5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full w-fit mb-2 bg-blue-100 text-blue-700">
                      {b.kategori || "Umum"}
                    </span>
                    <h4 className="text-[13px] font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {b.judul}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-auto">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {b.publishedAt ? formatDate(b.publishedAt) : ""}
                    </div>
                  </div>
                </article>
              ))}

              {/* View all */}
              <Link
                href="/berita"
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors text-[13px] font-bold mt-auto h-[120px]"
              >
                Lihat Semua Berita
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
