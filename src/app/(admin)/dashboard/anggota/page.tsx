import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Phone, Mail, Pencil, Search, ShieldCheck } from "lucide-react";
import { ExportAnggotaButton } from "@/components/admin/ExportAnggotaButton";
import DeleteAnggotaButton from "@/components/admin/DeleteAnggotaButton";
import Pagination from "@/components/admin/Pagination";

export const metadata = { title: "Data Anggota" };

const PER_PAGE = 15;

export default async function DataAnggotaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const statusFilter = params.status ?? "SEMUA";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: any = {
    ...(q
      ? {
          OR: [
            { namaLengkap: { contains: q, mode: "insensitive" } },
            { nik: { contains: q, mode: "insensitive" } },
            { noHp: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(statusFilter !== "SEMUA" ? { status: statusFilter } : {}),
  };

  const [anggotaList, totalFiltered, totalAktif, totalNonAktif, totalAlumni] = await Promise.all([
    prisma.anggota.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.anggota.count({ where }),
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    prisma.anggota.count({ where: { status: "NON_AKTIF" } }),
    prisma.anggota.count({ where: { status: "ALUMNI" } }),
  ]);

  const totalAll = totalAktif + totalNonAktif + totalAlumni;
  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/anggota?status=${statusFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const statusColor: Record<string, string> = {
    AKTIF: "bg-green-100 text-green-700",
    NON_AKTIF: "bg-red-100 text-red-700",
    ALUMNI: "bg-slate-200 text-slate-700",
  };

  const genderLabel: Record<string, string> = {
    LAKI_LAKI: "Laki-laki",
    PEREMPUAN: "Perempuan",
  };

  const filterTabs = [
    { label: "Semua", value: "SEMUA", count: totalAll },
    { label: "Aktif", value: "AKTIF", count: totalAktif },
    { label: "Non-Aktif", value: "NON_AKTIF", count: totalNonAktif },
    { label: "Alumni", value: "ALUMNI", count: totalAlumni },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Anggota</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data seluruh anggota Karang Taruna
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportAnggotaButton data={anggotaList} />
          <Link
            href="/dashboard/anggota/tambah"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Anggota
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1">Total</p>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-green-600 font-semibold mb-1">Aktif</p>
          <p className="text-2xl font-extrabold text-green-600">{totalAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-red-500 font-semibold mb-1">Non-Aktif</p>
          <p className="text-2xl font-extrabold text-red-500">{totalNonAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1">Alumni</p>
          <p className="text-2xl font-extrabold text-slate-600">{totalAlumni}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <form method="GET" className="flex gap-2 flex-1 max-w-md">
          <input type="hidden" name="status" value={statusFilter} />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Cari nama, NIK, HP, email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Cari
          </button>
          {q && (
            <Link
              href={`/dashboard/anggota?status=${statusFilter}`}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Reset
            </Link>
          )}
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/dashboard/anggota?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] ${statusFilter === tab.value ? "opacity-80" : "opacity-60"}`}>
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Anggota</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">NIK</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Jenis Kelamin</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Kontak</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Akun</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Tanggal Gabung</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anggotaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      {q || statusFilter !== "SEMUA"
                        ? "Tidak ada anggota yang sesuai filter"
                        : "Belum ada data anggota"}
                    </p>
                  </td>
                </tr>
              ) : (
                anggotaList.map((a: any) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {a.foto ? (
                          <img
                            src={a.foto}
                            alt={a.namaLengkap}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {a.namaLengkap.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.namaLengkap}</p>
                          <p className="text-xs text-slate-500">{a.pekerjaan || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-700 font-mono">{a.nik}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-700">{genderLabel[a.jenisKelamin] || a.jenisKelamin}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        {a.noHp && (
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {a.noHp}
                          </span>
                        )}
                        {a.email && (
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {a.email}
                          </span>
                        )}
                        {!a.noHp && !a.email && <span className="text-xs text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(a.tanggalGabung)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/anggota/edit/${a.id}`}
                          title="Edit Anggota"
                          aria-label="Edit Anggota"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteAnggotaButton id={a.id} nama={a.namaLengkap} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {anggotaList.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} anggota
              {(q || statusFilter !== "SEMUA") && " (difilter)"}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
