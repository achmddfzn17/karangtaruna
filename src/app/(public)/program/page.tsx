import * as LucideIcons from "lucide-react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Program } from "@prisma/client";

export const metadata = {
  title: "Program Kami - Karang Taruna Generasi Emas",
};

export default async function ProgramPage() {
  const programs = await prisma.program.findMany({
    where: { status: true },
    orderBy: { urutan: "asc" },
  });

  // Helper function to dynamically render Lucide icons with better type safety
  const getIcon = (iconName: string | null) => {
    if (!iconName) return ShoppingBag;
    const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[iconName];
    return Icon || ShoppingBag;
  };

  return (
    <div className="pt-[104px]">
      {/* Hero Section */}
      <section className="bg-slate-900 relative overflow-hidden py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/2" />
        </div>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-0.5 bg-blue-500 rounded-full" />
            <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">
              Inisiatif Kami
            </span>
            <div className="w-12 h-0.5 bg-blue-500 rounded-full" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Program <span className="text-blue-500 text-glow">Unggulan</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Dedikasi nyata Karang Taruna Generasi Emas dalam mengembangkan
            potensi pemuda dan memberikan dampak positif bagi seluruh lapisan
            masyarakat melalui program strategis yang berkelanjutan.
          </p>
        </div>
      </section>

      {/* Program Grid */}
      <section className="py-24 md:py-32 bg-[#fcfdfe]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-xl">Belum ada program unggulan yang aktif.</p>
              </div>
            ) : (
              programs.map((program: Program) => {
                const Icon = getIcon(program.icon);
                return (
                  <article
                    key={program.id}
                    className="group bg-white border border-slate-100 rounded-[32px] p-10 transition-all duration-500 hover:-translate-y-3 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col relative overflow-hidden"
                  >
                    {/* Decorative background circle */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Icon */}
                    <div className="relative z-10 w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                      <Icon className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-500" />
                    </div>

                    <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-5 group-hover:text-blue-600 transition-colors tracking-tight">
                      {program.nama}
                    </h3>
                    <p className="relative z-10 text-[15px] text-slate-500 leading-relaxed mb-10 flex-1 font-medium">
                      {program.deskripsi || "Informasi mengenai program ini akan segera diperbarui."}
                    </p>

                    <Link
                      href="/kegiatan"
                      className="relative z-10 inline-flex items-center justify-center gap-3 w-full py-4 bg-slate-50 text-[13px] font-black text-slate-900 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 group/btn shadow-sm"
                    >
                      Lihat Kegiatan Terkait
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
