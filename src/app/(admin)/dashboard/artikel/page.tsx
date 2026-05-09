import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Plus, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteArtikel } from "./actions";
import { Artikel } from "@prisma/client";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";

export const metadata = { title: "Data Artikel" };

export default async function DataArtikelPage() {
  const artikelList = await prisma.artikel.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-600 border-amber-100",
    PUBLISHED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    ARCHIVED: "bg-slate-50 text-slate-500 border-slate-100",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Artikel</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola artikel edukatif dan literasi Karang Taruna</p>
        </div>
        <Link
          href="/dashboard/artikel/tambah"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Artikel
        </Link>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-6">Konten Artikel</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Kategori</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4 text-center">Views</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Status</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Tanggal</th>
                <th className="text-right text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {artikelList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Belum ada artikel tersedia</p>
                    <p className="text-sm mt-1">Gunakan tombol di atas untuk menulis artikel pertama Anda</p>
                  </td>
                </tr>
              ) : (
                artikelList.map((a: Artikel) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-all group">
                    <td className="py-5 px-6">
                      <p className="text-sm font-black text-slate-800 line-clamp-1 max-w-xs group-hover:text-blue-600 transition-colors">{a.judul}</p>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-xs mt-1">{a.ringkasan || "Tidak ada ringkasan tersedia"}</p>
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-violet-50 text-violet-600 border border-violet-100">
                        {a.kategori || "Umum"}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-bold border border-slate-100">
                        <Eye className="w-3.5 h-3.5" />
                        {a.viewCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${statusColor[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{formatDate(a.createdAt)}</td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/artikel/${a.slug}`} title="Review Artikel" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90">
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <Link href={`/dashboard/artikel/edit/${a.slug}`} title="Edit Artikel" className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90">
                          <Pencil className="w-4.5 h-4.5" />
                        </Link>
                        <DeleteConfirmButton
                          action={deleteArtikel.bind(null, a.id)}
                          itemId={a.id}
                          message={`Hapus artikel "${a.judul}"? Tindakan ini tidak dapat dibatalkan.`}
                          title="Hapus Artikel"
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
