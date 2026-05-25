import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export default async function DetailArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const artikel = await prisma.artikel.findUnique({
    where: { slug },
  });

  if (!artikel || artikel.status !== "PUBLISHED") {
    notFound();
  }

  await prisma.artikel.update({
    where: { id: artikel.id },
    data: { viewCount: { increment: 1 } },
  });

  // ✅ XSS FIX: Sanitize HTML content
  const sanitizedContent = await sanitizeHtml(artikel.isi);

  // Schema.org JSON-LD untuk SEO Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.judul,
    datePublished: artikel.publishedAt?.toISOString(),
    dateModified: artikel.updatedAt.toISOString(),
    description: artikel.ringkasan,
    author: {
      "@type": "Organization",
      name: "Karang Taruna Generasi Emas",
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
          {artikel.kategori || "Artikel"}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{artikel.judul}</h1>
        <p className="text-slate-500 font-medium">{formatDate(artikel.publishedAt!)}</p>
      </header>

      {artikel.thumbnail && (
        <div className="w-full h-[400px] bg-slate-100 rounded-3xl mb-10 overflow-hidden relative">
          <img
            src={artikel.thumbnail}
            alt={artikel.judul}
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
