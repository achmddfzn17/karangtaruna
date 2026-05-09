import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ArtikelSection() {
  const artikelList = await prisma.artikel.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <section className="py-24 bg-[#fcfdfe]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">
                Wawasan Pemuda
              </span>
            </div>
            <h2 className="text-3xl md:text-[44px] font-black text-slate-900 leading-tight tracking-tight">
              Artikel <span className="text-blue-600">Edukatif</span>
            </h2>
            <p className="text-[15px] md:text-lg text-slate-500 mt-4 max-w-xl font-medium leading-relaxed">
              Kumpulan artikel inspiratif dan edukatif untuk mengembangkan
              wawasan dan potensi pemuda Indonesia dalam membangun bangsa.
            </p>
          </div>
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 shadow-sm transition-all whitespace-nowrap group"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {artikelList.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">Belum ada artikel yang dipublikasikan.</p>
            </div>
          ) : (
            artikelList.map((a) => (
              <article
                key={a.id}
                className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                {a.thumbnail && (
                  <div className="h-52 relative overflow-hidden">
                    <Image
                      src={a.thumbnail}
                      alt={a.judul}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-blue-700 shadow-lg">
                        {a.kategori || "Edukasi"}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex flex-col flex-1">
                  {!a.thumbnail && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-50">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full bg-blue-50 text-blue-700">
                        {a.kategori || "Edukasi"}
                      </span>
                    </div>
                  )}

                  <h3 className="font-black text-xl text-slate-900 mb-4 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 tracking-tight">
                    {a.judul}
                  </h3>

                  <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-3 mb-8 font-medium">
                    {a.ringkasan || "Klik untuk membaca selengkapnya artikel edukatif yang kami sediakan untuk Anda."}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 pt-6 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatDate(a.publishedAt || a.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-black text-sm rounded-[20px] hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all duration-300"
          >
            Eksplorasi Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
