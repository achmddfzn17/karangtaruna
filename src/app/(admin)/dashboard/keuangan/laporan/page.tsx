import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import LaporanKeuanganCharts from "@/components/admin/LaporanKeuanganCharts";
import ExportKeuanganButton from "@/components/admin/ExportKeuanganButton";

export const metadata = { title: "Laporan Keuangan" };

export default async function LaporanKeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const params = await searchParams;
  const tahunAktif = params.tahun ? parseInt(params.tahun) : new Date().getFullYear();

  // Ambil semua transaksi tahun aktif
  const transaksiTahun = await prisma.transaksiKeuangan.findMany({
    where: {
      tanggal: {
        gte: new Date(tahunAktif, 0, 1),
        lt: new Date(tahunAktif + 1, 0, 1),
      },
    },
    include: { kategori: true },
    orderBy: { tanggal: "asc" },
  });

  // Ringkasan per bulan
  const bulanNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const perBulan = bulanNames.map((nama, idx) => {
    const bulanTransaksi = transaksiTahun.filter(
      (t) => new Date(t.tanggal).getMonth() === idx
    );
    const masuk = bulanTransaksi.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + t.jumlah, 0);
    const keluar = bulanTransaksi.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + t.jumlah, 0);
    return { nama, masuk, keluar, saldo: masuk - keluar, jumlahTransaksi: bulanTransaksi.length };
  });

  // Total tahun ini
  const totalMasuk = transaksiTahun.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = transaksiTahun.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + t.jumlah, 0);
  const saldoTahun = totalMasuk - totalKeluar;

  // Ringkasan per kategori
  const perKategori: Record<string, { nama: string; masuk: number; keluar: number }> = {};
  transaksiTahun.forEach((t) => {
    const key = t.kategoriId || "umum";
    const nama = t.kategori?.nama || "Umum";
    if (!perKategori[key]) perKategori[key] = { nama, masuk: 0, keluar: 0 };
    if (t.jenis === "MASUK") perKategori[key].masuk += t.jumlah;
    else perKategori[key].keluar += t.jumlah;
  });

  // Tahun tersedia
  const tahunList = Array.from(
    { length: new Date().getFullYear() - 2022 },
    (_, i) => 2023 + i
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/keuangan" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Laporan Keuangan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Ringkasan arus kas per bulan dan kategori</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Pilih tahun */}
          <form method="GET">
            <select
              name="tahun"
              defaultValue={tahunAktif}
              onChange={(e) => (e.target.form as HTMLFormElement).submit()}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              {tahunList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </form>
          <ExportKeuanganButton
            transaksi={transaksiTahun as any}
            totalPemasukan={totalMasuk}
            totalPengeluaran={totalKeluar}
            saldo={saldoTahun}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-blue-200" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Saldo Tahun {tahunAktif}</p>
          </div>
          <p className={`text-3xl font-extrabold ${saldoTahun >= 0 ? "text-white" : "text-red-300"}`}>
            {formatCurrency(saldoTahun)}
          </p>
          <p className="text-[11px] text-blue-200 mt-1">{transaksiTahun.length} transaksi</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Total Pemasukan</p>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totalMasuk)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">Total Pengeluaran</p>
          </div>
          <p className="text-3xl font-extrabold text-red-500">{formatCurrency(totalKeluar)}</p>
        </div>
      </div>

      {/* Chart */}
      <LaporanKeuanganCharts perBulan={perBulan} />

      {/* Tabel per bulan */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-slate-800">Ringkasan Per Bulan — {tahunAktif}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Bulan</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Pemasukan</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Pengeluaran</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Saldo Bulan</th>
                <th className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {perBulan.map((b, i) => (
                <tr key={i} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${b.jumlahTransaksi === 0 ? "opacity-40" : ""}`}>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-800">{b.nama} {tahunAktif}</td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-600">
                    {b.masuk > 0 ? `+${formatCurrency(b.masuk)}` : "-"}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-red-500">
                    {b.keluar > 0 ? `-${formatCurrency(b.keluar)}` : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-extrabold ${b.saldo >= 0 ? "text-blue-600" : "text-red-500"}`}>
                      {b.saldo !== 0 ? formatCurrency(b.saldo) : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {b.jumlahTransaksi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="py-3 px-4 text-sm font-extrabold text-slate-900">Total</td>
                <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-600">+{formatCurrency(totalMasuk)}</td>
                <td className="py-3 px-4 text-right text-sm font-extrabold text-red-500">-{formatCurrency(totalKeluar)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`text-sm font-extrabold ${saldoTahun >= 0 ? "text-blue-600" : "text-red-500"}`}>
                    {formatCurrency(saldoTahun)}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-sm font-extrabold text-slate-700">{transaksiTahun.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Per Kategori */}
      {Object.keys(perKategori).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Ringkasan Per Kategori</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {Object.values(perKategori).map((k, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                <div className="flex items-center gap-6 text-sm">
                  {k.masuk > 0 && <span className="font-bold text-emerald-600">+{formatCurrency(k.masuk)}</span>}
                  {k.keluar > 0 && <span className="font-bold text-red-500">-{formatCurrency(k.keluar)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
