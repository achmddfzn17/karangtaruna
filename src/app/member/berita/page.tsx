import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Newspaper, Calendar, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const metadata = {
  title: "Berita & Artikel | Portal Anggota",
};

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const params = await searchParams;
  const kategoriFilter = params.kategori;

  // Fetch berita
  const berita = await prisma.berita.findMany({
    where: {
      status: "PUBLISHED",
      ...(kategoriFilter && { kategori: kategoriFilter }),
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  // Get unique categories
  const allBerita = await prisma.berita.findMany({
    where: { status: "PUBLISHED" },
    select: { kategori: true },
  });
  const categories = Array.from(
    new Set(allBerita.map((b) => b.kategori).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Newspaper className="w-7 h-7 text-blue-600" />
          Berita & Artikel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi terbaru seputar kegiatan Karang Taruna
        </p>
      </div>

      {/* Filter Kategori */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/member/berita"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !kategoriFilter
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            Semua
          </Link>
          {categories.map((kat) => (
            <Link
              key={kat}
              href={`/member/berita?kategori=${kat}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                kategoriFilter === kat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {kat}
            </Link>
          ))}
        </div>
      )}

      {/* Berita Grid */}
      {berita.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {berita.map((item) => (
            <Link
              key={item.id}
              href={`/member/berita/${item.slug}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Thumbnail */}
              {item.thumbnail ? (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Newspaper className="w-16 h-16 text-white/30" />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Kategori & Date */}
                <div className="flex items-center gap-3 mb-3">
                  {item.kategori && (
                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                      {item.kategori}
                    </span>
                  )}
                  {item.publishedAt && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.publishedAt), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.judul}
                </h3>

                {/* Ringkasan */}
                {item.ringkasan && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {item.ringkasan}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Eye className="w-3 h-3" />
                    {item.viewCount} views
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Baca
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Belum ada berita untuk kategori ini
          </p>
        </div>
      )}
    </div>
  );
}
