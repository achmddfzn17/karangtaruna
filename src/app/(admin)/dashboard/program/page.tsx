import { prisma } from "@/lib/prisma";
import { Layers, Plus, Check, X, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteProgram } from "./actions";

export const metadata = { title: "Data Program" };

export default async function DataProgramPage() {
  const programList = await prisma.program.findMany({
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Program</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola program kerja Karang Taruna</p>
        </div>
        <Link href="/dashboard/program/tambah" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Program
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4 w-16">Urutan</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Program Kerja</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4 text-center">Status Aktif</th>
                <th className="text-right text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {programList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada data program</p>
                  </td>
                </tr>
              ) : (
                programList.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-sm font-bold text-slate-400 text-center">{p.urutan}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-lg">{p.deskripsi || "-"}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.status ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 mx-auto" title="Aktif">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 mx-auto" title="Nonaktif">
                          <X className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href="/program" title="Review Program" aria-label="Review Program" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/program/edit/${p.id}`} title="Edit Program" aria-label="Edit Program" className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <form action={deleteProgram.bind(null, p.id)}>
                          <button type="submit" title="Hapus Program" aria-label="Hapus Program" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
