import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Calendar, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export const metadata = {
  title: "Artikel | Portal Anggota",
};

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const params = await searchParams;
  const kategoriFilter = params.kategori;

  const artikel = await prisma.artikel.findMany({
    where: {
      status: "PUBLISHED",
      ...(kategoriFilter && { kategori: kategoriFilter }),
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const allArtikel = await prisma.artikel.findMany({
    where: { status: "PUBLISHED" },
    select: { kategori: true },
  });
  const categories = Array.from(
    new Set(allArtikel.map((a) => a.kategori).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600" />
          Artikel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Artikel dan tulisan dari Karang Taruna
        </p>
      </div>

      {/* Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/member/artikel"
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
              href={`/member/artikel?kategori=${kat}`}
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

      {artikel.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artikel.map((item) => (
            <Link
              key={item.id}
              href={`/member/artikel/${item.slug}`}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {item.thumbnail ? (
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/30" />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {item.kategori && (
                    <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                      {item.kategori}
                    </span>
                  )}
                  {item.publishedAt && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.publishedAt), "d MMM yyyy", { locale: localeId })}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.judul}
                </h3>

                {item.ringkasan && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {item.ringkasan}
                  </p>
                )}

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
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada artikel tersedia</p>
        </div>
      )}
    </div>
  );
}
