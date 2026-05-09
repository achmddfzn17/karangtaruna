import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Calendar, Plus, Trash2, Pencil, Users, Search } from "lucide-react";
import { deleteKegiatan } from "./tambah/actions";
import Pagination from "@/components/admin/Pagination";
import { Prisma, JenisKegiatan, StatusKegiatan } from "@prisma/client";

export const metadata = { title: "Data Kegiatan" };

const PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; jenis?: string; status?: string; page?: string }>;
}

export default async function DataKegiatanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const jenisFilter = (params.jenis as JenisKegiatan | "SEMUA") ?? "SEMUA";
  const statusFilter = (params.status as StatusKegiatan | "SEMUA") ?? "SEMUA";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: Prisma.KegiatanWhereInput = {
    AND: [
      q ? { nama: { contains: q, mode: "insensitive" } } : {},
      jenisFilter !== "SEMUA" ? { jenis: jenisFilter } : {},
      statusFilter !== "SEMUA" ? { status: statusFilter } : {},
    ],
  };

  const [kegiatanList, totalFiltered] = await Promise.all([
    prisma.kegiatan.findMany({
      where,
      orderBy: { tanggalMulai: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { peserta: true, galeri: true } } },
    }),
    prisma.kegiatan.count({ where }),
  ]);

  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/kegiatan?jenis=${jenisFilter}&status=${statusFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const jenisColor: Record<JenisKegiatan, string> = {
    SOSIAL: "bg-green-100 text-green-700",
    PENDIDIKAN: "bg-blue-100 text-blue-700",
    EKONOMI: "bg-amber-100 text-amber-700",
    OLAHRAGA: "bg-orange-100 text-orange-700",
    SENI_BUDAYA: "bg-purple-100 text-purple-700",
    LAINNYA: "bg-gray-100 text-gray-600",
  };

  const statusColor: Record<StatusKegiatan, string> = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    SELESAI: "bg-gray-100 text-gray-600",
    DIBATALKAN: "bg-red-100 text-red-700",
  };

  const jenisOptions = [
    { value: "SEMUA", label: "Semua Jenis" },
    { value: "SOSIAL", label: "Sosial" },
    { value: "PENDIDIKAN", label: "Pendidikan" },
    { value: "EKONOMI", label: "Ekonomi" },
    { value: "OLAHRAGA", label: "Olahraga" },
    { value: "SENI_BUDAYA", label: "Seni & Budaya" },
    { value: "LAINNYA", label: "Lainnya" },
  ];

  const statusOptions = [
    { value: "SEMUA", label: "Semua Status" },
    { value: "UPCOMING", label: "Upcoming" },
    { value: "ONGOING", label: "Ongoing" },
    { value: "SELESAI", label: "Selesai" },
    { value: "DIBATALKAN", label: "Dibatalkan" },
  ];

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

      {/* Search & Filter */}
      <form
        method="GET"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Nama kegiatan..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jenis</label>
          <select
            name="jenis"
            defaultValue={jenisFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            {jenisOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Filter
        </button>
        {(q || jenisFilter !== "SEMUA" || statusFilter !== "SEMUA") && (
          <Link
            href="/dashboard/kegiatan"
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Kegiatan</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Jenis</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Lokasi</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Peserta</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Tidak ada kegiatan ditemukan</p>
                  </td>
                </tr>
              ) : (
                kegiatanList.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                        {k.deskripsi || "-"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          jenisColor[k.jenis]
                        }`}
                      >
                        {k.jenis.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">
                      {formatDate(k.tanggalMulai)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{k.lokasi || "-"}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/kegiatan/peserta/${k.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[12px] transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {k._count.peserta}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          statusColor[k.status]
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/kegiatan/edit/${k.id}`}
                          title="Edit Kegiatan"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <form action={deleteKegiatan.bind(null, k.id)}>
                          <button
                            type="submit"
                            title="Hapus Kegiatan"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
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

        {totalFiltered > 0 && (
          <div className="px-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500 font-medium py-3">
              Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalFiltered)} dari{" "}
              {totalFiltered} kegiatan
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
