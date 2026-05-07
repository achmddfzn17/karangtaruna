import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Pencil, Tag, FileImage, BarChart3 } from "lucide-react";
import Link from "next/link";
import DeleteTransaksiButton from "@/components/admin/DeleteTransaksiButton";
import ExportKeuanganButton from "@/components/admin/ExportKeuanganButton";
import Pagination from "@/components/admin/Pagination";

export const metadata = { title: "Keuangan" };

const PER_PAGE = 20;

export default async function KeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; bulan?: string; tahun?: string; page?: string }>;
}) {
  const params = await searchParams;
  const jenisFilter = params.jenis ?? "SEMUA";
  const bulanFilter = params.bulan ? parseInt(params.bulan) : null;
  const tahunFilter = params.tahun ? parseInt(params.tahun) : null;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: any = {
    ...(jenisFilter !== "SEMUA" ? { jenis: jenisFilter } : {}),
    ...(bulanFilter && tahunFilter
      ? {
          tanggal: {
            gte: new Date(tahunFilter, bulanFilter - 1, 1),
            lt: new Date(tahunFilter, bulanFilter, 1),
          },
        }
      : tahunFilter
      ? {
          tanggal: {
            gte: new Date(tahunFilter, 0, 1),
            lt: new Date(tahunFilter + 1, 0, 1),
          },
        }
      : {}),
  };

  const transaksiList = await prisma.transaksiKeuangan.findMany({
    where,
    orderBy: { tanggal: "desc" },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    include: { kategori: true },
  });

  const totalFiltered = await prisma.transaksiKeuangan.count({ where });
  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/keuangan?jenis=${jenisFilter}${bulanFilter ? `&bulan=${bulanFilter}` : ""}${tahunFilter ? `&tahun=${tahunFilter}` : ""}`;

  // Hitung dari SEMUA transaksi (bukan filtered) untuk summary cards
  const allTransaksi = await prisma.transaksiKeuangan.findMany({
    select: { jumlah: true, jenis: true },
  });
  const totalPemasukan = allTransaksi
    .filter((t) => t.jenis === "MASUK")
    .reduce((sum, t) => sum + t.jumlah, 0);
  const totalPengeluaran = allTransaksi
    .filter((t) => t.jenis === "KELUAR")
    .reduce((sum, t) => sum + t.jumlah, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  // Filtered totals — hitung dari semua data filtered (bukan hanya halaman ini)
  const allFiltered = await prisma.transaksiKeuangan.findMany({
    where,
    select: { jumlah: true, jenis: true },
  });
  const filteredPemasukan = allFiltered
    .filter((t) => t.jenis === "MASUK")
    .reduce((sum, t) => sum + t.jumlah, 0);
  const filteredPengeluaran = allFiltered
    .filter((t) => t.jenis === "KELUAR")
    .reduce((sum, t) => sum + t.jumlah, 0);

  const isFiltered = jenisFilter !== "SEMUA" || bulanFilter || tahunFilter;

  // Tahun tersedia untuk filter
  const tahunList = Array.from(
    { length: new Date().getFullYear() - 2022 },
    (_, i) => 2023 + i
  );
  const bulanList = [
    { value: 1, label: "Januari" }, { value: 2, label: "Februari" },
    { value: 3, label: "Maret" }, { value: 4, label: "April" },
    { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
    { value: 7, label: "Juli" }, { value: 8, label: "Agustus" },
    { value: 9, label: "September" }, { value: 10, label: "Oktober" },
    { value: 11, label: "November" }, { value: 12, label: "Desember" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">Laporan arus kas dan transparansi dana</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportKeuanganButton
            transaksi={transaksiList as any}
            totalPemasukan={filteredPemasukan}
            totalPengeluaran={filteredPengeluaran}
            saldo={filteredPemasukan - filteredPengeluaran}
          />
          <Link
            href="/dashboard/keuangan/laporan"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Laporan
          </Link>
          <Link
            href="/dashboard/keuangan/kategori"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <Tag className="w-4 h-4" />
            Kelola Kategori
          </Link>
          <Link
            href="/dashboard/keuangan/tambah"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Saldo Kas Saat Ini</p>
          <p className={`text-3xl font-extrabold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatCurrency(saldo)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 flex flex-col justify-between h-32">
          <p className="text-sm font-semibold text-emerald-800">Total Pemasukan</p>
          <p className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totalPemasukan)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6 flex flex-col justify-between h-32">
          <p className="text-sm font-semibold text-red-800">Total Pengeluaran</p>
          <p className="text-3xl font-extrabold text-red-600">{formatCurrency(totalPengeluaran)}</p>
        </div>
      </div>

      {/* Filter */}
      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jenis</label>
          <select
            name="jenis"
            defaultValue={jenisFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="SEMUA">Semua Jenis</option>
            <option value="MASUK">Pemasukan</option>
            <option value="KELUAR">Pengeluaran</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bulan</label>
          <select
            name="bulan"
            defaultValue={bulanFilter ?? ""}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">Semua Bulan</option>
            {bulanList.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tahun</label>
          <select
            name="tahun"
            defaultValue={tahunFilter ?? ""}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">Semua Tahun</option>
            {tahunList.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Filter
        </button>
        {isFiltered && (
          <Link
            href="/dashboard/keuangan"
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Info filtered */}
      {isFiltered && (
        <div className="flex items-center gap-4 text-sm text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <span>
            Menampilkan <strong className="text-blue-700">{transaksiList.length}</strong> transaksi
          </span>
          <span>·</span>
          <span>
            Pemasukan: <strong className="text-emerald-600">{formatCurrency(filteredPemasukan)}</strong>
          </span>
          <span>·</span>
          <span>
            Pengeluaran: <strong className="text-red-500">{formatCurrency(filteredPengeluaran)}</strong>
          </span>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Keterangan</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Kategori</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Jumlah</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada riwayat transaksi</p>
                  </td>
                </tr>
              ) : (
                transaksiList.map((t: any) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-sm text-slate-600">{formatDate(t.tanggal)}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800">{t.keterangan}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-medium">
                        {t.kategori?.nama || "Umum"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.jenis === "MASUK" ? (
                        <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-sm">
                          <ArrowDownRight className="w-4 h-4" />
                          +{formatCurrency(t.jumlah)}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 text-red-500 font-bold text-sm">
                          <ArrowUpRight className="w-4 h-4" />
                          -{formatCurrency(t.jumlah)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {t.bukti && (
                          <a
                            href={t.bukti}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat bukti transaksi"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileImage className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/dashboard/keuangan/edit/${t.id}`}
                          title="Edit Transaksi"
                          aria-label="Edit Transaksi"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteTransaksiButton id={t.id} keterangan={t.keterangan} />
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
              Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} transaksi
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
