import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ChevronRight,
  Eye,
  Target,
  Heart,
  CheckCircle,
  Users,
  Crown,
  BookOpen,
  Briefcase,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Pelajari sejarah, visi, misi, nilai-nilai, dan struktur kepengurusan Karang Taruna Generasi Emas.",
};

const pengurus = [
  {
    nama: "Budi Santoso",
    jabatan: "Ketua Umum",
    periode: "2023–2026",
    icon: Crown,
    bg: "bg-blue-500",
    textColor: "text-white",
  },
  {
    nama: "Dewi Rahayu",
    jabatan: "Wakil Ketua",
    periode: "2023–2026",
    icon: Users,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Andi Kurniawan",
    jabatan: "Sekretaris Umum",
    periode: "2023–2026",
    icon: BookOpen,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Fitriani Putri",
    jabatan: "Bendahara Umum",
    periode: "2023–2026",
    icon: Briefcase,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Rizky Firmansyah",
    jabatan: "Ketua Bidang Ekonomi",
    periode: "2023–2026",
    icon: Briefcase,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Sari Wulandari",
    jabatan: "Ketua Bidang Sosial",
    periode: "2023–2026",
    icon: Heart,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Hendra Kusuma",
    jabatan: "Ketua Bidang Pendidikan",
    periode: "2023–2026",
    icon: BookOpen,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
  {
    nama: "Lestari Ningrum",
    jabatan: "Ketua Bidang Lingkungan",
    periode: "2023–2026",
    icon: CheckCircle,
    bg: "bg-blue-50",
    textColor: "text-blue-500",
  },
];

const nilaiValues = [
  {
    title: "Integritas",
    description:
      "Menjunjung tinggi kejujuran dan transparansi dalam setiap tindakan.",
    color: "bg-white border-slate-100",
    iconColor: "text-blue-500",
  },
  {
    title: "Gotong Royong",
    description:
      "Membangun solidaritas dan kerja sama yang erat antar sesama anggota.",
    color: "bg-white border-slate-100",
    iconColor: "text-blue-500",
  },
  {
    title: "Inovasi",
    description:
      "Mendorong kreativitas dan solusi baru dalam menghadapi tantangan.",
    color: "bg-white border-slate-100",
    iconColor: "text-blue-500",
  },
  {
    title: "Kebangsaan",
    description: "Menanamkan rasa cinta tanah air dan semangat bela negara.",
    color: "bg-white border-slate-100",
    iconColor: "text-blue-500",
  },
];

const timeline = [
  {
    year: "2020",
    title: "Pendirian Organisasi",
    desc: "Karang Taruna Generasi Emas resmi didirikan oleh 25 pemuda dengan semangat memberdayakan generasi muda.",
    color: "bg-blue-500",
  },
  {
    year: "2021",
    title: "Program Perdana",
    desc: "Meluncurkan 3 program unggulan pertama: Beasiswa Pemuda, Pelatihan Keterampilan, dan Bakti Sosial Rutin.",
    color: "bg-blue-500",
  },
  {
    year: "2022",
    title: "Ekspansi Keanggotaan",
    desc: "Jumlah anggota meningkat hingga 150 orang dan membuka sekretariat tetap di pusat kota.",
    color: "bg-blue-500",
  },
  {
    year: "2023",
    title: "Penghargaan Pertama",
    desc: "Meraih penghargaan organisasi kepemudaan terbaik tingkat kota untuk pertama kalinya.",
    color: "bg-blue-500",
  },
  {
    year: "2024",
    title: "Penghargaan Nasional",
    desc: "Meraih penghargaan bergengsi tingkat nasional dan membuka program digital sebagai inovasi terbaru.",
    color: "bg-blue-500",
  },
  {
    year: "2025",
    title: "Digitalisasi Penuh",
    desc: "Meluncurkan sistem informasi digital terintegrasi untuk pengelolaan anggota, kegiatan, dan keuangan.",
    color: "bg-blue-500",
  },
];

export default function TentangPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-32 pb-20 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Tentang Kami</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-6">
              <Shield className="w-3.5 h-3.5" />
              Tentang Organisasi
            </span>
            <h1 className="text-4xl md:text-[56px] font-extrabold text-slate-900 mb-6 leading-[1.1]">
              Tentang Karang Taruna{" "}
              <span className="text-blue-500">Generasi Emas</span>
            </h1>
            <p className="text-[16px] text-slate-600 leading-relaxed max-w-2xl">
              Mengenal lebih dekat organisasi kepemudaan yang berkomitmen
              membangun Indonesia lebih baik melalui pemberdayaan generasi muda.
            </p>
          </div>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-5">
                Sejarah
              </span>
              <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 mb-6 leading-tight">
                Perjalanan Panjang{" "}
                <span className="text-blue-500">Menuju Prestasi</span>
              </h2>
              <div className="space-y-6 text-[15px] text-slate-600 leading-relaxed">
                <p>
                  Karang Taruna Generasi Emas lahir dari keprihatinan sekelompok
                  pemuda yang melihat besarnya potensi generasi muda yang belum
                  termaksimalkan. Pada tahun 2020, dua puluh lima pemuda
                  bersemangat berkumpul dan bersepakat untuk mendirikan sebuah
                  wadah yang dapat menjadi katalisator perubahan positif di
                  masyarakat.
                </p>
                <p>
                  Berawal dari sebuah komunitas kecil dengan keterbatasan sumber
                  daya, Karang Taruna Generasi Emas terus berkembang secara
                  konsisten. Program demi program diluncurkan, keanggotaan terus
                  bertambah, dan dampak positif yang dirasakan masyarakat
                  semakin luas.
                </p>
                <p>
                  Hari ini, dengan lebih dari 247 anggota aktif dan puluhan
                  program yang telah dijalankan, Karang Taruna Generasi Emas
                  berdiri kokoh sebagai salah satu organisasi kepemudaan terbaik
                  dan paling berpengaruh di wilayah Jawa Barat.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-5">
                Linimasa
              </span>
              <h3 className="text-2xl md:text-[32px] font-extrabold text-slate-900 mb-8 leading-tight">
                Tonggak Sejarah Kami
              </h3>
              <div className="relative">
                {/* Line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-blue-100" />
                <div className="space-y-8">
                  {timeline.map((item) => (
                    <div key={item.year} className="relative flex gap-6">
                      <div
                        className={`relative z-10 w-10 h-10 ${item.color} rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20`}
                      >
                        <span className="text-white text-[11px] font-extrabold">
                          {item.year.slice(2)}
                        </span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 flex-1 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900 text-[15px]">
                            {item.title}
                          </span>
                          <span className="text-[12px] text-blue-500 font-extrabold bg-blue-50 px-2 py-1 rounded-md">
                            {item.year}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 md:py-28 bg-[#f4f9ff] border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Visi & Misi
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 mb-4 leading-tight">
              Arah & Tujuan <span className="text-blue-500">Organisasi</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Visi */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-[24px] font-extrabold text-slate-900 mb-4">Visi</h3>
              <p className="text-slate-600 leading-relaxed text-[16px]">
                &ldquo;Menjadi organisasi kepemudaan yang terdepan, berdampak,
                dan berkarakter dalam mewujudkan generasi muda Indonesia yang
                mandiri, inovatif, dan berdaya saing global.&rdquo;
              </p>
            </div>

            {/* Misi */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-[24px] font-extrabold text-slate-900 mb-4">Misi</h3>
              <ul className="space-y-4">
                {[
                  "Memberdayakan potensi pemuda melalui program pendidikan dan pelatihan berkelanjutan",
                  "Menyelenggarakan kegiatan sosial kemasyarakatan yang berdampak nyata",
                  "Mengembangkan jiwa kewirausahaan dan kemandirian ekonomi pemuda",
                  "Melestarikan seni, budaya, dan kearifan lokal daerah",
                  "Membangun jaringan kerja sama dengan berbagai institusi dan stakeholder",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-[14px] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nilai-Nilai */}
          <div>
            <h3 className="text-[24px] font-extrabold text-slate-900 mb-8 text-center">
              Nilai-Nilai Kami
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nilaiValues.map((n) => (
                <div
                  key={n.title}
                  className={`border rounded-2xl p-6 ${n.color} shadow-sm`}
                >
                  <h4 className={`font-extrabold text-[16px] mb-3 ${n.iconColor}`}>{n.title}</h4>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    {n.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Pengurus */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
              Kepengurusan
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 mb-4 leading-tight">
              Struktur <span className="text-blue-500">Pengurus</span>
            </h2>
            <p className="text-[15px] text-slate-600 max-w-xl mx-auto">
              Para pemimpin muda yang berdedikasi dalam menjalankan roda
              organisasi untuk periode 2023–2026.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pengurus.map((p: any) => (
              <div
                key={p.nama}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
              >
                {/* Avatar */}
                <div
                  className={`w-16 h-16 ${p.bg} rounded-2xl flex items-center justify-center mb-5`}
                >
                  <p.icon className={`w-8 h-8 ${p.textColor}`} />
                </div>
                <h4 className="font-extrabold text-[16px] text-slate-900 mb-1">{p.nama}</h4>
                <p className="text-[13px] text-blue-500 font-bold mb-3">
                  {p.jabatan}
                </p>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 rounded-md px-3 py-1">
                  {p.periode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
