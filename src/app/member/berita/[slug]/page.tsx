import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import ShareButton from "@/components/member/ShareButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const berita = await prisma.berita.findUnique({
    where: { slug },
  });

  return {
    title: berita?.judul || "Berita",
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const { slug } = await params;
  const berita = await prisma.berita.findUnique({
    where: { slug },
  });

  if (!berita || berita.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view count
  await prisma.berita.update({
    where: { id: berita.id },
    data: { viewCount: { increment: 1 } },
  });

  // Get related berita
  const relatedBerita = await prisma.berita.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: berita.id },
      ...(berita.kategori && { kategori: berita.kategori }),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/member/berita"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Berita
      </Link>

      {/* Article */}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Thumbnail */}
        {berita.thumbnail && (
          <div className="aspect-video bg-slate-100 overflow-hidden">
            <img
              src={berita.thumbnail}
              alt={berita.judul}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            {berita.kategori && (
              <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                {berita.kategori}
              </span>
            )}
            {berita.publishedAt && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {format(new Date(berita.publishedAt), "d MMMM yyyy", {
                  locale: localeId,
                })}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Eye className="w-4 h-4" />
              {berita.viewCount + 1} views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {berita.judul}
          </h1>

          {/* Ringkasan */}
          {berita.ringkasan && (
            <p className="text-lg text-slate-600 mb-6 pb-6 border-b border-slate-200">
              {berita.ringkasan}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: berita.isi }}
          />

          {/* Tags */}
          {berita.tags && berita.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                {berita.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <ShareButton
              title={berita.judul}
              url={`/member/berita/${berita.slug}`}
            />
          </div>
        </div>
      </article>

      {/* Related Berita */}
      {relatedBerita.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Berita Terkait
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedBerita.map((item) => (
              <Link
                key={item.id}
                href={`/member/berita/${item.slug}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.judul}
                </h3>
                {item.publishedAt && (
                  <p className="text-xs text-slate-400">
                    {format(new Date(item.publishedAt), "d MMM yyyy", {
                      locale: localeId,
                    })}
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
