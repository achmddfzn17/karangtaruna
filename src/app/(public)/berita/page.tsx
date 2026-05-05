import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight, Search, Tag, Eye, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Berita dan informasi terkini dari Karang Taruna Generasi Emas.",
};

const beritaList = [
  {
    id: "1",
    title: "Karang Taruna Generasi Emas Raih Penghargaan Nasional Organisasi Kepemudaan Terbaik 2024",
    kategori: "Prestasi",
    kategoriColor: "bg-amber-100 text-amber-700",
    date: "10 Januari 2025",
    excerpt: "Karang Taruna Generasi Emas berhasil meraih penghargaan bergengsi tingkat nasional sebagai organisasi kepemudaan terbaik tahun 2024.",
    bgClass: "bg-slate-200",
    views: 1204,
  },
  {
    id: "2",
    title: "Program Beasiswa Pemuda Berprestasi Dibuka Kembali untuk Tahun 2025",
    kategori: "Pendidikan",
    kategoriColor: "bg-purple-100 text-purple-700",
    date: "8 Januari 2025",
    excerpt: "Program beasiswa tahunan kembali dibuka dengan kuota 50 penerima dari seluruh wilayah. Pendaftaran dibuka hingga 28 Februari 2025.",
    bgClass: "bg-slate-200",
    views: 876,
  },
  {
    id: "3",
    title: "Peluncuran Aplikasi Sistem Informasi Karang Taruna Digital",
    kategori: "Teknologi",
    kategoriColor: "bg-blue-100 text-blue-700",
    date: "5 Januari 2025",
    excerpt: "Aplikasi digital resmi diluncurkan untuk memudahkan anggota dalam mengakses informasi kegiatan, administrasi, dan laporan keuangan.",
    bgClass: "bg-slate-200",
    views: 654,
  },
  {
    id: "4",
    title: "Kolaborasi dengan 12 UMKM Lokal dalam Program Pemberdayaan Ekonomi",
    kategori: "Ekonomi",
    kategoriColor: "bg-green-100 text-green-700",
    date: "2 Januari 2025",
    excerpt: "Kemitraan strategis dengan UMKM lokal untuk membuka peluang usaha bagi anggota dan masyarakat sekitar dengan modal awal yang terjangkau.",
    bgClass: "bg-slate-200",
    views: 432,
  },
  {
    id: "5",
    title: "Karang Taruna Gelar Turnamen E-Sport Tingkat Regional Pertama",
    kategori: "Olahraga",
    kategoriColor: "bg-rose-100 text-rose-700",
    date: "28 Desember 2024",
    excerpt: "Menyambut tren gaming positif di kalangan pemuda, Karang Taruna untuk pertama kalinya menggelar turnamen e-sport tingkat regional.",
    bgClass: "bg-slate-200",
    views: 789,
  },
  {
    id: "6",
    title: "Rapat Koordinasi Akhir Tahun Sepakati Program Kerja 2025",
    kategori: "Organisasi",
    kategoriColor: "bg-slate-100 text-slate-700",
    date: "20 Desember 2024",
    excerpt: "Seluruh pengurus dan perwakilan anggota berkumpul dalam rapat koordinasi untuk menyusun dan menyepakati program kerja tahun 2025.",
    bgClass: "bg-slate-200",
    views: 321,
  },
];

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  const filtered = beritaList.filter(
    (b) => !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.excerpt.toLowerCase().includes(q.toLowerCase())
  );

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
            Menemukan <span className="font-extrabold text-blue-600">{filtered.length}</span> berita
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📰</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak ada berita ditemukan</h3>
              <p className="text-[15px] text-slate-500">Coba kata kunci yang berbeda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((b: any) => (
                <article
                  key={b.id}
                  className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className={`h-48 ${b.bgClass} relative flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-slate-300 relative z-0" />
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-full ${b.kategoriColor} uppercase tracking-wide`}>
                        <Tag className="w-3 h-3" />
                        {b.kategori}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[12px] font-bold text-slate-400 mb-4 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        {b.views.toLocaleString("id-ID")} VIEWS
                      </span>
                    </div>
                    <h3 className="font-bold text-[18px] text-slate-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors leading-snug flex-1">
                      {b.title}
                    </h3>
                    <p className="text-[13px] text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                      {b.excerpt}
                    </p>
                    <Link
                      href={`/berita/${b.id}`}
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
