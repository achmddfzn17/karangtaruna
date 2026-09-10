import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/safe-query";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export default async function DetailBeritaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const berita = await safeQuery(
    () => prisma.berita.findUnique({ where: { slug } }),
    null,
    "DetailBeritaPage",
  );

  if (!berita || berita.status !== "PUBLISHED") {
    notFound();
  }

  // Naikkan view count best effort. Kalau database sedang bermasalah, jangan
  // sampai menghentikan render halaman berita.
  await safeQuery(
    () =>
      prisma.berita.update({
        where: { id: berita.id },
        data: { viewCount: { increment: 1 } },
      }),
    null,
    "DetailBeritaPage:viewCount",
  );

  // ✅ XSS FIX: Sanitize HTML content
  const sanitizedContent = await sanitizeHtml(berita.isi);

  // Schema.org JSON-LD untuk SEO Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: berita.judul,
    datePublished: berita.publishedAt?.toISOString(),
    dateModified: berita.updatedAt.toISOString(),
    description: berita.ringkasan,
    author: {
      "@type": "Organization",
      name: "Karang Taruna Muda Berkarya",
    },
  };

  return (
    <article className="pt-[140px] pb-20 max-w-4xl mx-auto px-4">
      {/* Script JSON-LD yang tersembunyi namun dibaca oleh mesin pencari */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="mb-10 text-center">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
          {berita.kategori || "Berita Utama"}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{berita.judul}</h1>
        <p className="text-slate-500 font-medium">{formatDate(berita.publishedAt!)}</p>
      </header>

      {berita.thumbnail && (
        <div className="w-full h-[400px] bg-slate-100 rounded-3xl mb-10 overflow-hidden relative">
          <img
            src={berita.thumbnail}
            alt={berita.judul}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ✅ XSS FIX: Use sanitized HTML */}
      <div 
        className="prose prose-lg prose-blue max-w-none text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
}
