import { prisma } from "@/lib/prisma";
import { Layers, Plus, Check, X, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteProgram } from "./actions";
import { Program } from "@prisma/client";
import { DeleteProgramButton } from "@/components/admin/DeleteProgramButton";

export const metadata = { title: "Data Program" };

export default async function DataProgramPage() {
  const programList = await prisma.program.findMany({
    orderBy: { urutan: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Program</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola program kerja dan inisiatif Karang Taruna</p>
        </div>
        <Link href="/dashboard/program/tambah" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="w-4 h-4" />
          Tambah Program
        </Link>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="text-center text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4 w-20">Urutan</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Program Kerja</th>
                <th className="text-center text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Status Aktif</th>
                <th className="text-right text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {programList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Belum ada data program</p>
                    <p className="text-sm mt-1">Klik tombol di atas untuk membuat program baru</p>
                  </td>
                </tr>
              ) : (
                programList.map((p: Program) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-all group">
                    <td className="py-5 px-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto font-black text-slate-500 text-sm">
                        {p.urutan}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{p.nama}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-1 max-w-lg">{p.deskripsi || "Tidak ada deskripsi tersedia"}</p>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="flex justify-center">
                        {p.status ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider" title="Aktif">
                            <Check className="w-3.5 h-3.5" />
                            AKTIF
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider" title="Nonaktif">
                            <X className="w-3.5 h-3.5" />
                            NONAKTIF
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href="/program" 
                          title="Review Program" 
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <Link 
                          href={`/dashboard/program/edit/${p.id}`} 
                          title="Edit Program" 
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                        >
                          <Pencil className="w-4.5 h-4.5" />
                        </Link>
                        <DeleteProgramButton 
                          action={deleteProgram.bind(null, p.id)} 
                          programId={p.id}
                        />
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
