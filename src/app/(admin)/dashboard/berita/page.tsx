import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Newspaper, Plus, Eye, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteBerita } from "./actions";

export const metadata = { title: "Data Berita" };

export default async function DataBeritaPage() {
  const beritaList = await prisma.berita.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Berita</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola berita dan informasi Karang Taruna</p>
        </div>
        <Link
          href="/dashboard/berita/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Berita
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Judul</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Kategori</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Views</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                <th className="text-right text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {beritaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada berita</p>
                  </td>
                </tr>
              ) : (
                beritaList.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 max-w-xs">{b.judul}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{b.ringkasan || "-"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600">
                        {b.kategori || "Umum"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {b.viewCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{formatDate(b.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/berita/${b.id}`} title="Review Berita" aria-label="Review Berita" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/berita/edit/${b.id}`} title="Edit Berita" aria-label="Edit Berita" className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <form action={deleteBerita.bind(null, b.id)}>
                          <button type="submit" title="Hapus Berita" aria-label="Hapus Berita" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
