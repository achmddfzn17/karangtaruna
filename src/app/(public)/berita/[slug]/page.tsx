import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

// Halaman di-cache secara statis dan diregenerasi otomatis setiap 60 detik (ISR)
export const revalidate = 60; 

export default async function DetailBeritaPage({ params }: { params: { slug: string } }) {
  const berita = await prisma.berita.findUnique({
    where: { slug: params.slug },
  });

  if (!berita || berita.status !== "PUBLISHED") {
    notFound();
  }

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
          {berita.kategori || "Berita Utama"}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{berita.judul}</h1>
        <p className="text-slate-500 font-medium">{formatDate(berita.publishedAt!)}</p>
      </header>

      {berita.thumbnail && (
        <div className="w-full h-[400px] bg-slate-100 rounded-3xl mb-10 overflow-hidden relative">
          {/* Implementasikan Image Next.js di sini nanti */}
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Gambar Thumbnail Berita
          </div>
        </div>
      )}

      <div className="prose prose-lg prose-blue max-w-none text-slate-700 leading-relaxed">
        {berita.isi}
      </div>
    </article>
  );
}
