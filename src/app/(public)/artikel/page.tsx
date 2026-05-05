import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  User,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Artikel edukatif dan inspiratif dari Karang Taruna Generasi Emas untuk pengembangan diri pemuda.",
};

const artikelList = [
  {
    id: "1",
    icon: BookOpen,
    iconColor: "text-blue-500 bg-blue-50",
    kategori: "Kepemimpinan",
    kategoriColor: "bg-blue-50 text-blue-500",
    title:
      "5 Prinsip Kepemimpinan Pemuda yang Harus Kamu Kuasai di Era Digital",
    excerpt:
      "Kepemimpinan di era digital menuntut adaptasi yang cepat. Pelajari 5 prinsip kunci yang akan membantumu menjadi pemimpin efektif.",
    readTime: "7 menit baca",
    author: "Rizky Pratama",
    date: "12 Jan 2025",
  },
  {
    id: "2",
    icon: FileText,
    iconColor: "text-green-500 bg-green-50",
    kategori: "Kewirausahaan",
    kategoriColor: "bg-green-50 text-green-500",
    title: "Memulai Usaha dari Nol: Panduan Lengkap untuk Pemuda Milenial",
    excerpt:
      "Ingin berwirausaha tapi bingung mulai dari mana? Artikel ini membahas langkah-langkah praktis dalam membangun bisnis dari nol.",
    readTime: "10 menit baca",
    author: "Siti Nurhaliza",
    date: "9 Jan 2025",
  },
  {
    id: "3",
    icon: BookOpen,
    iconColor: "text-purple-500 bg-purple-50",
    kategori: "Pengembangan Diri",
    kategoriColor: "bg-purple-50 text-purple-500",
    title: "Strategi Belajar Efektif untuk Meningkatkan Potensi Diri",
    excerpt:
      "Dengan pendekatan belajar yang tepat, setiap pemuda dapat mengembangkan potensinya secara maksimal dan berkesinambungan.",
    readTime: "6 menit baca",
    author: "Ahmad Fauzi",
    date: "6 Jan 2025",
  },
  {
    id: "4",
    icon: FileText,
    iconColor: "text-amber-500 bg-amber-50",
    kategori: "Keuangan",
    kategoriColor: "bg-amber-50 text-amber-500",
    title: "Cara Cerdas Mengelola Keuangan Pribadi di Usia Muda",
    excerpt:
      "Manajemen keuangan yang baik sejak dini adalah kunci kesejahteraan di masa depan. Pelajari tips praktis mengelola uang dengan bijak.",
    readTime: "8 menit baca",
    author: "Dian Permatasari",
    date: "3 Jan 2025",
  },
  {
    id: "5",
    icon: BookOpen,
    iconColor: "text-red-500 bg-red-50",
    kategori: "Kesehatan",
    kategoriColor: "bg-red-50 text-red-500",
    title: "Pentingnya Menjaga Kesehatan Mental di Tengah Tekanan Sosial",
    excerpt:
      "Tekanan sosial dapat berdampak serius pada kesehatan mental pemuda. Kenali tanda-tanda dan cara efektif menjaga keseimbangan pikiran.",
    readTime: "9 menit baca",
    author: "dr. Maya Sari",
    date: "30 Des 2024",
  },
  {
    id: "6",
    icon: FileText,
    iconColor: "text-teal-500 bg-teal-50",
    kategori: "Lingkungan",
    kategoriColor: "bg-teal-50 text-teal-500",
    title: "Peran Pemuda dalam Menjaga Kelestarian Lingkungan Hidup",
    excerpt:
      "Generasi muda memiliki tanggung jawab besar dalam menjaga lingkungan. Simak bagaimana kamu bisa berkontribusi secara nyata mulai hari ini.",
    readTime: "5 menit baca",
    author: "Eko Prasetyo",
    date: "27 Des 2024",
  },
];

const categories = [
  "Semua",
  "Kepemimpinan",
  "Kewirausahaan",
  "Pengembangan Diri",
  "Keuangan",
  "Kesehatan",
  "Lingkungan",
];

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kat = typeof params.kat === "string" ? params.kat : "Semua";

  const filtered = artikelList.filter((a: any) => {
    const matchQ = !q || a.title.toLowerCase().includes(q.toLowerCase());
    const matchKat = kat === "Semua" || a.kategori === kat;
    return matchQ && matchKat;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Artikel</span>
          </nav>
          <h1 className="text-4xl md:text-[56px] font-extrabold text-slate-900 mb-6 leading-[1.1]">
            Artikel <span className="text-blue-500">Edukatif</span>
          </h1>
          <p className="text-[16px] text-slate-600 max-w-xl leading-relaxed">
            Koleksi artikel inspiratif dan edukatif untuk mengembangkan wawasan
            dan potensi pemuda Indonesia.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <form method="GET" className="flex gap-4 mb-8 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input name="kat" defaultValue={kat} type="hidden" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Cari artikel..."
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

          {/* Category pills */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/artikel?kat=${encodeURIComponent(c)}&q=${q}`}
                className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                  kat === c
                    ? "bg-blue-500 text-white border-transparent shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Artikel tidak ditemukan
              </h3>
              <p className="text-[15px] text-slate-500">
                Coba kategori atau kata kunci yang berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a: any) => (
                <article
                  key={a.id}
                  className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col p-6 relative"
                >
                  <div className="flex flex-col flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.iconColor}`}
                      >
                        <a.icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full ${a.kategoriColor} uppercase tracking-wide`}
                      >
                        {a.kategori}
                      </span>
                    </div>
                    <h3 className="font-bold text-[18px] text-slate-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                      {a.title}
                    </h3>
                    <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 mb-6">
                      {a.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-5 border-t border-slate-100 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>{a.author}</span>
                      </div>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {a.readTime}
                      </span>
                    </div>
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
