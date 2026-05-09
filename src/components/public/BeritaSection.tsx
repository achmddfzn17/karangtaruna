import Link from "next/link";
import Image from "next/image";
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
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Info Terkini
              </span>
            </div>
            <h2 className="text-3xl md:text-[44px] font-black text-slate-900 leading-tight tracking-tight">
              Berita <span className="text-blue-600">Terbaru</span>
            </h2>
            <p className="text-[15px] md:text-lg text-slate-500 mt-4 max-w-xl font-medium leading-relaxed">
              Dapatkan informasi terkini seputar kegiatan, pencapaian, dan program
              strategis Karang Taruna Generasi Emas.
            </p>
          </div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all whitespace-nowrap group"
          >
            Semua Berita
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Layout: Featured + Side */}
        {beritaList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
            <Newspaper className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">Belum ada berita yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Featured (large card) */}
            <article className="lg:col-span-3 group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
              <div className="h-64 md:h-96 bg-slate-100 relative overflow-hidden">
                {featured.thumbnail ? (
                  <Image
                    src={featured.thumbnail}
                    alt={featured.judul}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Newspaper className="w-20 h-20 text-blue-200" />
                  </div>
                )}
                
                <div className="absolute bottom-6 left-6">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xl shadow-blue-600/30">
                    <Tag className="w-3.5 h-3.5" />
                    {featured.kategori || "Umum"}
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-blue-500 mb-5">
                  <Calendar className="w-4 h-4" />
                  {featured.publishedAt ? formatDate(featured.publishedAt) : ""}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-5 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                  {featured.judul}
                </h3>
                <p className="text-[15px] md:text-lg text-slate-500 leading-relaxed line-clamp-3 flex-1 font-medium">
                  {featured.ringkasan || "Baca berita selengkapnya mengenai perkembangan terkini Karang Taruna Generasi Emas."}
                </p>
                <Link
                  href={`/berita/${featured.slug}`}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-slate-50 text-[13px] font-black text-slate-900 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 mt-10 group/btn"
                >
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </article>

            {/* Other news cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {others.map((b) => (
                <Link
                  key={b.id}
                  href={`/berita/${b.slug}`}
                  className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1 flex gap-5 h-[140px]"
                >
                  {/* Thumbnail */}
                  <div className="w-36 shrink-0 bg-slate-100 relative overflow-hidden">
                    {b.thumbnail ? (
                      <Image
                        src={b.thumbnail}
                        alt={b.judul}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="150px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-50/50">
                        <Newspaper className="w-8 h-8 text-blue-200" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="py-4 pr-6 flex flex-col justify-center min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
                      {b.kategori || "Umum"}
                    </span>
                    <h4 className="text-[15px] font-black text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                      {b.judul}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-auto">
                      <Calendar className="w-3.5 h-3.5" />
                      {b.publishedAt ? formatDate(b.publishedAt) : ""}
                    </div>
                  </div>
                </Link>
              ))}

              {/* View all card */}
              <Link
                href="/berita"
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-[32px] border-2 border-dashed border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600 transition-all duration-300 h-[140px] group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:rotate-[-45deg]" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Lihat Semua Berita</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
