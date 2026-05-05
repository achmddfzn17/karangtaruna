import Link from "next/link";
import { BookOpen, Clock, User, ArrowRight, FileText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ArtikelSection() {
  const artikelList = await prisma.artikel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  return (
    <section className="py-20 md:py-28 bg-[#f4f9ff]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Artikel
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 leading-tight">
              Artikel <span className="text-blue-500">Edukatif</span>
            </h2>
            <p className="text-[15px] md:text-[16px] text-slate-600 mt-2 max-w-lg">
              Kumpulan artikel inspiratif dan edukatif untuk mengembangkan
              wawasan dan potensi pemuda Indonesia.
            </p>
          </div>
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-500 hover:text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artikelList.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center">Belum ada artikel yang dipublikasikan.</p>
          ) : (
            artikelList.map((a: any) => (
              <article
                key={a.id}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  {/* Icon + category */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 bg-blue-100">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                      {a.kategori || "Edukasi"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                    {a.judul}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[13px] md:text-[14px] text-slate-600 leading-relaxed line-clamp-3 mb-6">
                    {a.ringkasan || "Baca selengkapnya untuk mengetahui lebih lanjut."}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-5 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Admin</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {formatDate(a.publishedAt || a.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-blue-500 text-blue-500 font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Baca Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
