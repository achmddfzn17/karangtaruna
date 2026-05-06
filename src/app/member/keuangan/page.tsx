import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Transparansi Keuangan",
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function KeuanganPage() {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  // Fetch last 10 public transactions
  const transaksi = await prisma.transaksiKeuangan.findMany({
    orderBy: { tanggal: "desc" },
    take: 15,
    include: { kategori: true },
  });

  const totalMasuk = transaksi
    .filter((t) => t.jenis === "MASUK")
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalKeluar = transaksi
    .filter((t) => t.jenis === "KELUAR")
    .reduce((sum, t) => sum + t.jumlah, 0);

  const saldoAktif = totalMasuk - totalKeluar;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Transparansi Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Laporan keuangan organisasi yang terbuka untuk seluruh anggota
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[11px] font-bold text-green-700">Terverifikasi</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pemasukan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Pemasukan</p>
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-green-600">
            {formatRupiah(totalMasuk)}
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Pengeluaran</p>
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-red-500">
            {formatRupiah(totalKeluar)}
          </p>
        </div>

        {/* Saldo */}
        <div className={`p-6 rounded-2xl shadow-sm ${saldoAktif >= 0 ? "bg-blue-600 shadow-blue-500/20" : "bg-red-600 shadow-red-500/20"}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide">Saldo Saat Ini</p>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white">
            {formatRupiah(saldoAktif)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Riwayat Transaksi Terbaru
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">15 transaksi terakhir</span>
        </div>

        {transaksi.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Wallet className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 mb-1">Belum Ada Transaksi</h3>
            <p className="text-xs text-slate-400">Data keuangan akan tampil di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transaksi.map((t) => (
              <div key={t.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.jenis === "MASUK" ? "bg-green-100" : "bg-red-100"}`}>
                  {t.jenis === "MASUK" ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{t.keterangan}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {t.kategori && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 font-medium">{t.kategori.nama}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-extrabold ${t.jenis === "MASUK" ? "text-green-600" : "text-red-500"}`}>
                    {t.jenis === "MASUK" ? "+" : "-"}{formatRupiah(t.jumlah)}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.jenis === "MASUK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {t.jenis === "MASUK" ? "Masuk" : "Keluar"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/40">
          <p className="text-[11px] text-slate-400 text-center font-medium">
            Data keuangan dikelola oleh Bendahara Karang Taruna Generasi Emas dan diperbarui secara berkala.
          </p>
        </div>
      </div>
    </div>
  );
}
