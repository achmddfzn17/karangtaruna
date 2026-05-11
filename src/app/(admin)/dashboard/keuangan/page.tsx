import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownRight, Pencil, Tag, 
  FileImage, BarChart3, Settings, Filter, TrendingUp, TrendingDown,
  PiggyBank
} from "lucide-react";
import Link from "next/link";
import DeleteTransaksiButton from "@/components/admin/DeleteTransaksiButton";
import ExportKeuanganButton from "@/components/admin/ExportKeuanganButton";
import Pagination from "@/components/admin/Pagination";
import { Prisma, JenisTransaksi } from "@prisma/client";

export const metadata = { title: "Data Keuangan" };

const PER_PAGE = 15;

// Valid enum values for safe filtering
const VALID_JENIS: JenisTransaksi[] = ["MASUK", "KELUAR"];

interface PageProps {
  searchParams: Promise<{ jenis?: string; bulan?: string; tahun?: string; page?: string }>;
}

export default async function KeuanganPage({ searchParams }: PageProps) {
  // ✅ Auth check
  await requireAdmin();

  const params = await searchParams;
  
  // ✅ Safe validation for jenis filter
  const jenisParam = params.jenis;
  const jenisFilter: JenisTransaksi | "SEMUA" = 
    jenisParam && VALID_JENIS.includes(jenisParam as JenisTransaksi)
      ? (jenisParam as JenisTransaksi)
      : "SEMUA";
  
  const bulanFilter = params.bulan ? parseInt(params.bulan) : null;
  const tahunFilter = params.tahun ? parseInt(params.tahun) : null;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  // Build where condition
  const whereConditions: Prisma.TransaksiKeuanganWhereInput[] = [];
  if (jenisFilter !== "SEMUA") {
    whereConditions.push({ jenis: jenisFilter });
  }
  if (bulanFilter && tahunFilter) {
    whereConditions.push({
      tanggal: {
        gte: new Date(tahunFilter, bulanFilter - 1, 1),
        lt: new Date(tahunFilter, bulanFilter, 1),
      },
    });
  } else if (tahunFilter) {
    whereConditions.push({
      tanggal: {
        gte: new Date(tahunFilter, 0, 1),
        lt: new Date(tahunFilter + 1, 0, 1),
      },
    });
  }

  const where: Prisma.TransaksiKeuanganWhereInput = 
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // ✅ Parallel queries - combine aggregates for better performance
  const [
    transaksiList, 
    totalFiltered,
    globalPemasukan,
    globalPengeluaran,
    filteredPemasukan,
    filteredPengeluaran,
  ] = await Promise.all([
    prisma.transaksiKeuangan.findMany({
      where,
      orderBy: { tanggal: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { kategori: true },
    }),
    prisma.transaksiKeuangan.count({ where }),
    prisma.transaksiKeuangan.aggregate({
      where: { jenis: "MASUK" },
      _sum: { jumlah: true },
    }).then(r => r._sum.jumlah || 0),
    prisma.transaksiKeuangan.aggregate({
      where: { jenis: "KELUAR" },
      _sum: { jumlah: true },
    }).then(r => r._sum.jumlah || 0),
    prisma.transaksiKeuangan.aggregate({
      where: { ...where, jenis: "MASUK" },
      _sum: { jumlah: true },
    }).then(r => r._sum.jumlah || 0),
    prisma.transaksiKeuangan.aggregate({
      where: { ...where, jenis: "KELUAR" },
      _sum: { jumlah: true },
    }).then(r => r._sum.jumlah || 0),
  ]);

  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/keuangan?jenis=${jenisFilter}${bulanFilter ? `&bulan=${bulanFilter}` : ""}${tahunFilter ? `&tahun=${tahunFilter}` : ""}`;

  const saldo = globalPemasukan - globalPengeluaran;
  const filteredSaldo = filteredPemasukan - filteredPengeluaran;

  const isFiltered = jenisFilter !== "SEMUA" || !!bulanFilter || !!tahunFilter;

  // Tahun & bulan options
  const currentYear = new Date().getFullYear();
  const tahunList = Array.from(
    { length: Math.max(3, currentYear - 2022) },
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Keuangan
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola arus kas dan transparansi dana Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Pengelolaan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Tombol Pengelolaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data keuangan</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Transaksi */}
            <Link
              href="/dashboard/keuangan/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </Link>

            {/* Kelola Kategori */}
            <Link
              href="/dashboard/keuangan/kategori"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              <Tag className="w-4 h-4" />
              Kelola Kategori
            </Link>

            {/* Laporan */}
            <Link
              href="/dashboard/keuangan/laporan"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Laporan
            </Link>

            {/* Filter Form */}
            <form method="GET" className="flex gap-2 flex-wrap">
              <select
                name="jenis"
                defaultValue={jenisFilter}
                className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                aria-label="Filter jenis"
              >
                <option value="SEMUA">Semua Jenis</option>
                <option value="MASUK">Pemasukan</option>
                <option value="KELUAR">Pengeluaran</option>
              </select>

              <select
                name="bulan"
                defaultValue={bulanFilter ?? ""}
                className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                aria-label="Filter bulan"
              >
                <option value="">Semua Bulan</option>
                {bulanList.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>

              <select
                name="tahun"
                defaultValue={tahunFilter ?? ""}
                className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                aria-label="Filter tahun"
              >
                <option value="">Semua Tahun</option>
                {tahunList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              {isFiltered && (
                <Link
                  href="/dashboard/keuangan"
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* Export */}
            <div className="ml-auto">
              <ExportKeuanganButton
                transaksi={transaksiList}
                totalPemasukan={filteredPemasukan}
                totalPengeluaran={filteredPengeluaran}
                saldo={filteredPemasukan - filteredPengeluaran}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo */}
        <div className={`bg-gradient-to-br ${saldo >= 0 ? "from-blue-50 to-blue-100/50 border-blue-200/50" : "from-red-50 to-red-100/50 border-red-200/50"} rounded-2xl p-5 border`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${saldo >= 0 ? "bg-blue-500" : "bg-red-500"}`}>
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${saldo >= 0 ? "text-blue-600 bg-blue-100" : "text-red-600 bg-red-100"}`}>
              Saldo
            </span>
          </div>
          <p className={`text-2xl font-extrabold ${saldo >= 0 ? "text-slate-900" : "text-red-600"}`}>
            {formatCurrency(saldo)}
          </p>
          <p className="text-xs text-slate-600 font-medium mt-1">Saldo Kas Saat Ini</p>
        </div>

        {/* Pemasukan */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Pemasukan</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(globalPemasukan)}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Pemasukan</p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Pengeluaran</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(globalPengeluaran)}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Pengeluaran</p>
        </div>
      </div>

      {/* Filtered Info */}
      {isFiltered && (
        <div className="flex items-center gap-4 text-sm bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex-wrap">
          <span className="text-slate-700">
            Menampilkan <strong className="text-blue-700">{totalFiltered}</strong> transaksi
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700">
            Pemasukan: <strong className="text-green-600">{formatCurrency(filteredPemasukan)}</strong>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700">
            Pengeluaran: <strong className="text-red-600">{formatCurrency(filteredPengeluaran)}</strong>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-700">
            Saldo: <strong className={filteredSaldo >= 0 ? "text-blue-600" : "text-red-600"}>
              {formatCurrency(filteredSaldo)}
            </strong>
          </span>
        </div>
      )}

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Tabel Data Transaksi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {totalFiltered > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} transaksi
              {isFiltered && " (difilter)"}
            </p>
          </div>
        </div>

        {transaksiList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Wallet className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Transaksi</p>
            <p className="text-sm text-slate-500 mb-6">
              {isFiltered
                ? "Tidak ada transaksi yang sesuai filter"
                : "Mulai tambahkan transaksi keuangan"}
            </p>
            {!isFiltered && (
              <Link
                href="/dashboard/keuangan/tambah"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Transaksi
              </Link>
            )}
          </div>
        ) : (
          <>
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
                  {transaksiList.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatDate(t.tanggal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-slate-800">{t.keterangan}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-bold">
                          {t.kategori?.nama || "Umum"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.jenis === "MASUK" ? (
                          <div className="inline-flex items-center justify-end gap-1.5 text-green-600 font-bold text-sm">
                            <ArrowDownRight className="w-4 h-4" />
                            +{formatCurrency(t.jumlah)}
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-1.5 text-red-600 font-bold text-sm">
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
                              aria-label="Lihat bukti transaksi"
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
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Halaman {page} dari {totalPages}
                </p>
                <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Konfigurasi Data Keuangan */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Keuangan</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data keuangan</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Transaksi</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalFiltered} Transaksi</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Data Per Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{PER_PAGE} Transaksi</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPages} Halaman</p>
          </div>
        </div>
      </div>
    </div>
  );
}
