import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const metadata = { title: "Keuangan" };

export default async function KeuanganPage() {
  const transaksiList = await prisma.transaksiKeuangan.findMany({
    orderBy: { tanggal: "desc" },
    include: { kategori: true },
  });

  const totalPemasukan = transaksiList
    .filter((t: any) => t.jenis === "MASUK")
    .reduce((sum: number, t: any) => sum + t.jumlah, 0);

  const totalPengeluaran = transaksiList
    .filter((t: any) => t.jenis === "KELUAR")
    .reduce((sum: number, t: any) => sum + t.jumlah, 0);

  const saldo = totalPemasukan - totalPengeluaran;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Keuangan</h1>
          <p className="text-sm text-slate-400 mt-1">Laporan arus kas dan transparansi dana</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-between h-32">
          <p className="text-sm font-semibold text-slate-500">Saldo Kas Saat Ini</p>
          <p className="text-3xl font-extrabold text-blue-600">{formatCurrency(saldo)}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col justify-between h-32">
          <p className="text-sm font-semibold text-emerald-800">Total Pemasukan</p>
          <p className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totalPemasukan)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex flex-col justify-between h-32">
          <p className="text-sm font-semibold text-red-800">Total Pengeluaran</p>
          <p className="text-3xl font-extrabold text-red-600">{formatCurrency(totalPengeluaran)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Keterangan</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Kategori</th>
                <th className="text-right text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada riwayat transaksi</p>
                  </td>
                </tr>
              ) : (
                transaksiList.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-sm text-slate-500">{formatDate(t.tanggal)}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-slate-800">{t.keterangan}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
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
