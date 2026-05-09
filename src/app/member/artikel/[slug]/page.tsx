import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artikel = await prisma.artikel.findUnique({ where: { slug } });
  return { title: artikel?.judul || "Artikel" };
}

export default async function ArtikelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const { slug } = await params;

  const artikel = await prisma.artikel.findUnique({ where: { slug } });

  if (!artikel || artikel.status !== "PUBLISHED") notFound();

  // Increment view count
  await prisma.artikel.update({
    where: { id: artikel.id },
    data: { viewCount: { increment: 1 } },
  });

  const relatedArtikel = await prisma.artikel.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: artikel.id },
      ...(artikel.kategori && { kategori: artikel.kategori }),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/member/artikel"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Artikel
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {artikel.thumbnail && (
          <div className="aspect-video bg-slate-100 overflow-hidden">
            <img src={artikel.thumbnail} alt={artikel.judul} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            {artikel.kategori && (
              <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                {artikel.kategori}
              </span>
            )}
            {artikel.publishedAt && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {format(new Date(artikel.publishedAt), "d MMMM yyyy", { locale: localeId })}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Eye className="w-4 h-4" />
              {artikel.viewCount + 1} views
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">{artikel.judul}</h1>

          {artikel.ringkasan && (
            <p className="text-lg text-slate-600 mb-6 pb-6 border-b border-slate-200">
              {artikel.ringkasan}
            </p>
          )}

          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: artikel.isi }}
          />

          {artikel.tags && artikel.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
              {artikel.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {relatedArtikel.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArtikel.map((item) => (
              <Link
                key={item.id}
                href={`/member/artikel/${item.slug}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.judul}
                </h3>
                {item.publishedAt && (
                  <p className="text-xs text-slate-400">
                    {format(new Date(item.publishedAt), "d MMM yyyy", { locale: localeId })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
