import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, ChevronRight, Tag, Search, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Kegiatan",
  description:
    "Daftar seluruh kegiatan dan program yang diselenggarakan oleh Karang Taruna Generasi Emas.",
};

const kegiatanList = [
  {
    id: "1",
    title: "Pelatihan Kewirausahaan Digital untuk Pemuda",
    jenis: "EKONOMI",
    jenisLabel: "Ekonomi",
    jenisColor: "bg-blue-100 text-blue-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "15 Januari 2025",
    location: "Gedung Serbaguna, Bandung",
    excerpt: "Pelatihan intensif selama 3 hari tentang strategi bisnis digital, e-commerce, dan media sosial untuk pemuda.",
    bgClass: "bg-slate-200",
    peserta: 45,
  },
  {
    id: "2",
    title: "Bakti Sosial & Donor Darah Massal",
    jenis: "SOSIAL",
    jenisLabel: "Sosial",
    jenisColor: "bg-red-100 text-red-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "22 Januari 2025",
    location: "Lapangan Merdeka, Bandung",
    excerpt: "Kegiatan bakti sosial yang melibatkan ratusan relawan dengan program donor darah, pembagian sembako, dan pengobatan gratis.",
    bgClass: "bg-slate-200",
    peserta: 120,
  },
  {
    id: "3",
    title: "Festival Seni & Budaya Nusantara",
    jenis: "SENI_BUDAYA",
    jenisLabel: "Seni & Budaya",
    jenisColor: "bg-amber-100 text-amber-700",
    status: "UPCOMING",
    statusLabel: "Akan Datang",
    statusColor: "bg-blue-100 text-blue-700",
    date: "5 Februari 2025",
    location: "Taman Budaya Jawa Barat",
    excerpt: "Festival tahunan menampilkan beragam pertunjukan seni tradisional dan modern oleh pemuda dari seluruh wilayah.",
    bgClass: "bg-slate-200",
    peserta: 200,
  },
  {
    id: "4",
    title: "Workshop Pengembangan Aplikasi Mobile",
    jenis: "PENDIDIKAN",
    jenisLabel: "Pendidikan",
    jenisColor: "bg-purple-100 text-purple-700",
    status: "UPCOMING",
    statusLabel: "Akan Datang",
    statusColor: "bg-blue-100 text-blue-700",
    date: "12 Februari 2025",
    location: "Lab Komputer, Universitas Padjadjaran",
    excerpt: "Workshop hands-on pengembangan aplikasi mobile menggunakan React Native untuk pemuda yang ingin berkarir di bidang teknologi.",
    bgClass: "bg-slate-200",
    peserta: 30,
  },
  {
    id: "5",
    title: "Turnamen Futsal Antar RT/RW",
    jenis: "OLAHRAGA",
    jenisLabel: "Olahraga",
    jenisColor: "bg-green-100 text-green-700",
    status: "ONGOING",
    statusLabel: "Sedang Berlangsung",
    statusColor: "bg-yellow-100 text-yellow-700",
    date: "1-28 Februari 2025",
    location: "GOR Padjajaran, Bandung",
    excerpt: "Turnamen futsal tahunan yang mempertemukan tim-tim terbaik dari berbagai wilayah untuk memperebutkan Piala Ketua.",
    bgClass: "bg-slate-200",
    peserta: 160,
  },
  {
    id: "6",
    title: "Seminar Kesehatan Mental Remaja",
    jenis: "PENDIDIKAN",
    jenisLabel: "Pendidikan",
    jenisColor: "bg-purple-100 text-purple-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "8 Desember 2024",
    location: "Aula Kecamatan Cibeunying",
    excerpt: "Seminar edukasi tentang pentingnya menjaga kesehatan mental bagi remaja dengan pembicara psikolog berpengalaman.",
    bgClass: "bg-slate-200",
    peserta: 80,
  },
  {
    id: "7",
    title: "Penghijauan Sungai Cikapundung",
    jenis: "LAINNYA",
    jenisLabel: "Lingkungan",
    jenisColor: "bg-teal-100 text-teal-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "20 November 2024",
    location: "Tepian Sungai Cikapundung",
    excerpt: "Program penanaman 500 pohon di sepanjang tepian Sungai Cikapundung sebagai bagian dari program penghijauan kota.",
    bgClass: "bg-slate-200",
    peserta: 75,
  },
  {
    id: "8",
    title: "Pelatihan Public Speaking untuk Pemuda",
    jenis: "PENDIDIKAN",
    jenisLabel: "Pendidikan",
    jenisColor: "bg-purple-100 text-purple-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "5 November 2024",
    location: "Sekretariat Karang Taruna",
    excerpt: "Pelatihan public speaking dan kepercayaan diri untuk pemuda yang ingin mengembangkan kemampuan komunikasi profesional.",
    bgClass: "bg-slate-200",
    peserta: 35,
  },
  {
    id: "9",
    title: "Pembuatan Pupuk Kompos dari Sampah Organik",
    jenis: "LAINNYA",
    jenisLabel: "Lingkungan",
    jenisColor: "bg-teal-100 text-teal-700",
    status: "SELESAI",
    statusLabel: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    date: "15 Oktober 2024",
    location: "Balai RW 05, Bandung",
    excerpt: "Workshop praktis pembuatan pupuk kompos dari sampah organik rumah tangga untuk mendukung pertanian urban warga.",
    bgClass: "bg-slate-200",
    peserta: 40,
  },
];

const jenisOptions = [
  { value: "ALL", label: "Semua Jenis" },
  { value: "SOSIAL", label: "Sosial" },
  { value: "PENDIDIKAN", label: "Pendidikan" },
  { value: "EKONOMI", label: "Ekonomi" },
  { value: "OLAHRAGA", label: "Olahraga" },
  { value: "SENI_BUDAYA", label: "Seni & Budaya" },
  { value: "LAINNYA", label: "Lainnya" },
];

const statusOptions = [
  { value: "ALL", label: "Semua Status" },
  { value: "UPCOMING", label: "Akan Datang" },
  { value: "ONGOING", label: "Sedang Berlangsung" },
  { value: "SELESAI", label: "Selesai" },
];

export default async function KegiatanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const jenis = typeof params.jenis === "string" ? params.jenis : "ALL";
  const status = typeof params.status === "string" ? params.status : "ALL";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  // Filter mock data
  const filtered = kegiatanList.filter((k) => {
    const matchQ = !q || k.title.toLowerCase().includes(q.toLowerCase());
    const matchJenis = jenis === "ALL" || k.jenis === jenis;
    const matchStatus = status === "ALL" || k.status === status;
    return matchQ && matchJenis && matchStatus;
  });

  const limit = 6;
  const totalPages = Math.ceil(filtered.length / limit);
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-500 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Kegiatan</span>
          </nav>
          <h1 className="text-4xl md:text-[56px] font-extrabold text-slate-900 mb-6 leading-[1.1]">
            Kegiatan <span className="text-blue-500">Kami</span>
          </h1>
          <p className="text-slate-600 text-[16px] max-w-xl leading-relaxed">
            Seluruh kegiatan dan program yang telah, sedang, dan akan kami laksanakan untuk pemberdayaan pemuda.
          </p>
        </div>
      </section>

      {/* Filter + Search */}
      <section className="py-10 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <form method="GET" className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Cari kegiatan..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Jenis */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                name="jenis"
                aria-label="Filter jenis kegiatan"
                defaultValue={jenis}
                className="pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer transition-all min-w-[180px]"
              >
                {jenisOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {/* Status */}
            <div className="relative">
              <select
                name="status"
                aria-label="Filter status kegiatan"
                defaultValue={status}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer transition-all min-w-[180px]"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm"
            >
              Cari
            </button>
          </form>

          <p className="text-[13px] font-medium text-slate-500 mt-5">
            Menampilkan{" "}
            <span className="font-extrabold text-blue-600">{filtered.length}</span>{" "}
            kegiatan
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {paged.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak ada kegiatan ditemukan</h3>
              <p className="text-slate-500 text-[15px]">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((k: any) => (
                <article
                  key={k.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className={`h-48 ${k.bgClass} relative overflow-hidden flex items-center justify-center`}>
                    <Calendar className="w-12 h-12 text-slate-300 relative z-0" />
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full ${k.statusColor} uppercase tracking-wide`}>
                        {k.statusLabel}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-full ${k.jenisColor} uppercase tracking-wide`}>
                        <Tag className="w-3 h-3" />
                        {k.jenisLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {k.title}
                    </h3>
                    <p className="text-[13px] text-slate-600 line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {k.excerpt}
                    </p>
                    <div className="flex flex-col gap-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {k.date}
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-500">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {k.location}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md">
                        {k.peserta} PESERTA
                      </span>
                      <Link
                        href={`/kegiatan/${k.id}`}
                        className="text-[13px] font-bold text-blue-500 hover:text-blue-600 hover:underline"
                      >
                        Selengkapnya →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/kegiatan?page=${page - 1}&q=${q}&jenis=${jenis}&status=${status}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  ← Sebelumnya
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/kegiatan?page=${p}&q=${q}&jenis=${jenis}&status=${status}`}
                  className={`w-10 h-10 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors ${
                    p === page
                      ? "bg-blue-500 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/kegiatan?page=${page + 1}&q=${q}&jenis=${jenis}&status=${status}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  Selanjutnya →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
