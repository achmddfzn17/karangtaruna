import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight, Search, Tag, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Berita dan informasi terkini dari Karang Taruna Generasi Emas.",
};

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  const beritaList = await prisma.berita.findMany({
    where: {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { judul: { contains: q, mode: "insensitive" } },
              { ringkasan: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-500 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Berita</span>
          </nav>
          <h1 className="text-4xl md:text-[56px] font-extrabold text-slate-900 mb-6 leading-[1.1]">
            Berita <span className="text-blue-500">Terkini</span>
          </h1>
          <p className="text-[16px] text-slate-600 max-w-xl leading-relaxed">
            Informasi, pengumuman, dan liputan terbaru dari Karang Taruna Generasi Emas.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <form method="GET" className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Cari berita..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm"
            >
              Cari
            </button>
          </form>
          <p className="text-[13px] font-medium text-slate-500 mt-5">
            Menemukan <span className="font-extrabold text-blue-600">{beritaList.length}</span> berita
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {beritaList.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📰</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak ada berita ditemukan</h3>
              <p className="text-[15px] text-slate-500">Coba kata kunci yang berbeda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {beritaList.map((b) => (
                <article
                  key={b.id}
                  className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 bg-slate-200 relative flex items-center justify-center">
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                        <Tag className="w-3 h-3" />
                        {b.kategori || "Umum"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[12px] font-bold text-slate-400 mb-4 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {b.publishedAt ? formatDate(b.publishedAt) : formatDate(b.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        {b.viewCount.toLocaleString("id-ID")} VIEWS
                      </span>
                    </div>
                    <h3 className="font-bold text-[18px] text-slate-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors leading-snug flex-1">
                      {b.judul}
                    </h3>
                    <p className="text-[13px] text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                      {b.ringkasan || "Baca berita selengkapnya..."}
                    </p>
                    <Link
                      href={`/berita/${b.slug}`}
                      className="text-[13px] font-bold text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1 mt-auto"
                    >
                      Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
