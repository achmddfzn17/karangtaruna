import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Program Kami - Karang Taruna Generasi Emas",
};

export default async function ProgramPage() {
  const programs = await prisma.program.findMany({
    where: { status: true },
    orderBy: { urutan: "asc" },
  });

  // Helper function to dynamically render Lucide icons
  const getIcon = (iconName: string | null) => {
    if (!iconName) return LucideIcons.ShoppingBag;
    return (LucideIcons as any)[iconName] || LucideIcons.ShoppingBag;
  };

  return (
    <div className="pt-[104px]">
      {/* Hero Section */}
      <section className="bg-blue-600 relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/50 text-blue-50 text-sm font-bold tracking-wide mb-6 backdrop-blur-sm border border-blue-400/30">
            Fokus Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Program Unggulan
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Dedikasi nyata Karang Taruna Generasi Emas dalam mengembangkan
            potensi pemuda dan memberikan dampak positif bagi seluruh lapisan
            masyarakat.
          </p>
        </div>
      </section>

      {/* Program Grid */}
      <section className="py-20 md:py-28 bg-[#f4f9ff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center">Belum ada program unggulan.</p>
            ) : (
              programs.map((program) => {
                const Icon = getIcon(program.icon);
                return (
                  <div
                    key={program.id}
                    className="group bg-white border border-slate-100 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 flex flex-col"
                  >
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-8 h-8 text-blue-500`} />
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                      {program.nama}
                    </h3>
                    <p className="text-[15px] text-slate-600 leading-relaxed mb-8 flex-1">
                      {program.deskripsi}
                    </p>

                    <Link
                      href="/kegiatan"
                      className={`inline-flex items-center gap-2 text-[14px] font-bold text-blue-600 group-hover:gap-3 transition-all mt-auto`}
                    >
                      Lihat Kegiatan Terkait
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
