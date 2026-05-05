import Link from "next/link";
import {
  ShoppingBag,
  GraduationCap,
  Heart,
  Trophy,
  Leaf,
  HandHeart,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import * as LucideIcons from "lucide-react";

export default async function ProgramSection() {
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
    <section className="py-20 md:py-28 bg-[#f4f9ff]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-4">
            Program Kami
          </span>
          <h2 className="text-3xl md:text-[40px] font-extrabold text-slate-900 mb-4 leading-tight">
            Program{" "}
            <span className="text-blue-500">Unggulan Kami</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-[15px] md:text-[16px]">
            Enam bidang program strategis yang kami kembangkan untuk memaksimalkan
            potensi pemuda dan memberikan dampak positif bagi masyarakat.
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center">Belum ada program unggulan.</p>
          ) : (
            programs.map((program: any) => {
              const Icon = getIcon(program.icon);
              return (
                <div
                  key={program.id}
                  className={`group bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 text-blue-500`} />
                  </div>

                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">
                    {program.nama}
                  </h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-6 flex-1">
                    {program.deskripsi}
                  </p>

                  <Link
                    href={`/program`}
                    className={`inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:gap-2.5 transition-all mt-auto`}
                  >
                    Selengkapnya
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link
            href="/program"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-blue-500 text-blue-500 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            Lihat Semua Program
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
