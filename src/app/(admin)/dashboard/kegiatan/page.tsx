import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Calendar, Plus, Trash2, Pencil, Eye } from "lucide-react";
import { deleteKegiatan } from "./tambah/actions";

export const metadata = { title: "Data Kegiatan" };

export default async function DataKegiatanPage() {
  const kegiatanList = await prisma.kegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
    include: { _count: { select: { peserta: true, galeri: true } } },
  });

  const jenisColor: Record<string, string> = {
    SOSIAL: "bg-green-100 text-green-700",
    PENDIDIKAN: "bg-blue-100 text-blue-700",
    EKONOMI: "bg-amber-100 text-amber-700",
    OLAHRAGA: "bg-orange-100 text-orange-700",
    SENI_BUDAYA: "bg-purple-100 text-purple-700",
    LAINNYA: "bg-gray-100 text-gray-600",
  };

  const statusColor: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    SELESAI: "bg-gray-100 text-gray-600",
    DIBATALKAN: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Kegiatan</h1>
          <p className="text-sm text-slate-400 mt-1">Kelola seluruh kegiatan Karang Taruna</p>
        </div>
        <Link
          href="/dashboard/kegiatan/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Kegiatan</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Jenis</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Lokasi</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Peserta</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-right text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada data kegiatan</p>
                  </td>
                </tr>
              ) : (
                kegiatanList.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{k.deskripsi || "-"}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${jenisColor[k.jenis] || jenisColor.LAINNYA}`}>
                        {k.jenis.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{formatDate(k.tanggalMulai)}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{k.lokasi || "-"}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-600 font-semibold">{k._count.peserta}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor[k.status] || "bg-gray-100 text-gray-600"}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/kegiatan/${k.id}`} title="Review Kegiatan" aria-label="Review Kegiatan" className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/kegiatan/edit/${k.id}`} title="Edit Kegiatan" aria-label="Edit Kegiatan" className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <form action={deleteKegiatan.bind(null, k.id)}>
                          <button type="submit" title="Hapus Kegiatan" aria-label="Hapus Kegiatan" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
