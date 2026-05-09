import { CheckCircle, Eye, Compass, Heart } from "lucide-react";

const keyPoints = [
  {
    icon: Eye,
    color: "text-blue-600 bg-blue-50 border border-blue-100",
    title: "Visi",
    description:
      "Menjadi organisasi kepemudaan yang terdepan dalam pemberdayaan dan pengembangan potensi generasi muda di Indonesia.",
  },
  {
    icon: Compass,
    color: "text-blue-600 bg-blue-50 border border-blue-100",
    title: "Misi",
    description:
      "Menyelenggarakan program pemberdayaan sosial, ekonomi, pendidikan, dan budaya yang berdampak nyata bagi masyarakat.",
  },
  {
    icon: Heart,
    color: "text-blue-600 bg-blue-50 border border-blue-100",
    title: "Nilai-Nilai",
    description:
      "Integritas, gotong royong, inovasi, dan semangat kebangsaan menjadi fondasi dalam setiap langkah kami.",
  },
];

interface AboutSectionProps {
  statsData: {
    anggota: number;
    kegiatan: number;
    program: number;
    tahun: number;
  };
}

export default function AboutSection({ statsData }: AboutSectionProps) {
  const orgStats = [
    { value: "2020", label: "Tahun Berdiri" },
    { value: `${statsData.anggota}+`, label: "Anggota Aktif" },
    { value: `${statsData.program}`, label: "Program" },
    { value: `${statsData.kegiatan}`, label: "Kegiatan" },
  ];
  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col gap-4">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide">
                Tentang Kami
              </span>
            </div>

            <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 leading-tight">
              Membangun Generasi Muda yang{" "}
              <span className="text-blue-500">Berkarakter</span>
            </h2>

            <p className="text-slate-600 leading-relaxed text-[15px] md:text-[16px] mt-2">
              Karang Taruna Generasi Emas adalah organisasi kepemudaan yang
              berdiri sejak tahun 2020, berkedudukan di Kota Jakarta, Jakarta
              Pusat. Kami hadir dengan komitmen penuh untuk memberdayakan
              generasi muda agar menjadi pribadi yang mandiri, inovatif, dan
              berdaya saing tinggi dalam menghadapi tantangan zaman.
            </p>

            <p className="text-slate-600 leading-relaxed text-[15px] md:text-[16px] mb-4">
              Dengan lebih dari {statsData.anggota} anggota aktif yang tersebar di berbagai
              wilayah, kami terus mengembangkan program-program strategis yang
              menyentuh berbagai aspek kehidupan pemuda, mulai dari pendidikan,
              pemberdayaan ekonomi, hingga pelestarian seni budaya lokal.
            </p>

            {/* Key points */}
            <div className="space-y-3">
              {keyPoints.map(({ icon: Icon, color, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">
                      {title}
                    </h4>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Decorative Card Stack */}
          <div className="relative flex items-center justify-center">
            {/* Background card */}
            <div className="absolute w-72 h-80 bg-blue-100 rounded-3xl rotate-6" />
            <div className="absolute w-72 h-80 bg-blue-200 rounded-3xl rotate-3 opacity-60" />

            {/* Main card */}
            <div className="relative w-72 bg-white rounded-3xl p-7 border border-slate-100 shadow-xl shadow-slate-200/50">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Karang Taruna
                  </div>
                  <div className="text-xs text-blue-500 font-bold">
                    Generasi Emas
                  </div>
                </div>
                <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Aktif
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {orgStats.map(({ value, label }) => (
                  <div
                     key={label}
                     className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center"
                   >
                     <div className="text-xl font-extrabold text-blue-600 mb-1">
                       {value}
                     </div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
                   </div>
                ))}
              </div>

              {/* Footer info */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 text-center leading-relaxed">
                  Terdaftar resmi di Dinas Sosial Kota Jakarta
                </p>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-lg shadow-slate-200/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Keaktifan</div>
              <div className="text-lg font-extrabold text-green-600 mt-0.5">98%</div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-lg shadow-slate-200/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kepuasan</div>
              <div className="text-lg font-extrabold text-blue-500 mt-0.5">4.9/5.0</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
