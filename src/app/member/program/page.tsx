import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Layers, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { FC } from "react";

export const metadata = {
  title: "Program Kerja | Portal Anggota",
};

export default async function ProgramPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const programs = await prisma.program.findMany({
    where: { status: true },
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Layers className="w-7 h-7 text-blue-600" />
          Program Kerja
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Program dan inisiatif organisasi Karang Taruna
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada program kerja tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((program) => {
            // Dynamically resolve icon from lucide-react
            const IconComponent = program.icon
              ? ((LucideIcons as unknown as Record<string, FC<LucideProps>>)[program.icon] ?? Layers)
              : Layers;

            return (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>

                {/* Content */}
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {program.nama}
                </h3>

                {program.deskripsi && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {program.deskripsi}
                  </p>
                )}

                {/* Thumbnail */}
                {program.thumbnail && (
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-slate-100">
                    <img
                      src={program.thumbnail}
                      alt={program.nama}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
