import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  TrendingUp, TrendingDown, Wallet,
  ArrowUpCircle, ArrowDownCircle, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import KeuanganChart from "@/components/member/KeuanganChart";

export const metadata = { title: "Transparansi Keuangan" };

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function KeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");
  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  const params = await searchParams;
  const now = new Date();
  const selectedTahun = params.tahun ? parseInt(params.tahun) : now.getFullYear();
  const selectedBulan = params.bulan ? parseInt(params.bulan) : undefined;

  const whereClause = {
    ...(selectedBulan
      ? {
          tanggal: {
            gte: new Date(selectedTahun, selectedBulan - 1, 1),
            lt: new Date(selectedTahun, selectedBulan, 1),
          },
        }
      : {
          tanggal: {
            gte: new Date(selectedTahun, 0, 1),
            lt: new Date(selectedTahun + 1, 0, 1),
          },
        }),
  };

  const transaksi = await prisma.transaksiKeuangan.findMany({
    where: whereClause,
    orderBy: { tanggal: "desc" },
    include: { kategori: true },
  });

  const totalMasuk = transaksi.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = transaksi.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + t.jumlah, 0);
  const saldoAktif = totalMasuk - totalKeluar;

  // Build monthly chart data (only when viewing full year, not filtered by month)
  const bulanNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const chartData = !selectedBulan
    ? bulanNames.map((bulan, idx) => {
        const bulanTx = transaksi.filter((t) => new Date(t.tanggal).getMonth() === idx);
        return {
          bulan,
          masuk: bulanTx.filter((t) => t.jenis === "MASUK").reduce((s, t) => s + t.jumlah, 0),
          keluar: bulanTx.filter((t) => t.jenis === "KELUAR").reduce((s, t) => s + t.jumlah, 0),
        };
      })
    : null;

  const tahunOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const bulanOptions = [
    { value: "", label: "Semua Bulan" },
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
    { value: "3", label: "Maret" }, { value: "4", label: "April" },
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
    { value: "9", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Transparansi Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">Laporan keuangan organisasi yang terbuka untuk seluruh anggota</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[11px] font-bold text-green-700">Terverifikasi</span>
        </div>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        {/* Tahun */}
        <div className="flex gap-2 flex-wrap">
          {tahunOptions.map((tahun) => (
            <Link
              key={tahun}
              href={`/member/keuangan?tahun=${tahun}${selectedBulan ? `&bulan=${selectedBulan}` : ""}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedTahun === tahun
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {tahun}
            </Link>
          ))}
        </div>
        {/* Bulan */}
        <div className="flex gap-2 flex-wrap">
          {bulanOptions.map((b) => (
            <Link
              key={b.value}
              href={`/member/keuangan?tahun=${selectedTahun}${b.value ? `&bulan=${b.value}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                (selectedBulan?.toString() ?? "") === b.value
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {b.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Pemasukan</p>
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-green-600">{formatRupiah(totalMasuk)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Pengeluaran</p>
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-red-500">{formatRupiah(totalKeluar)}</p>
        </div>

        <div className={`p-6 rounded-2xl shadow-sm ${saldoAktif >= 0 ? "bg-blue-600 shadow-blue-500/20" : "bg-red-600 shadow-red-500/20"}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide">Saldo Periode</p>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white">{formatRupiah(saldoAktif)}</p>
        </div>
      </div>

      {/* Chart — only shown when viewing full year (no month filter) */}
      {chartData && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4">
            Grafik Arus Kas {selectedTahun}
          </h2>
          <KeuanganChart data={chartData} />
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Riwayat Transaksi</h2>
          <span className="text-[11px] text-slate-400 font-medium">{transaksi.length} transaksi</span>
        </div>

        {transaksi.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Wallet className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600 mb-1">Tidak Ada Transaksi</p>
            <p className="text-xs text-slate-400">Tidak ada transaksi pada periode ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transaksi.map((t) => (
              <div key={t.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.jenis === "MASUK" ? "bg-green-100" : "bg-red-100"}`}>
                  {t.jenis === "MASUK"
                    ? <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    : <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  }
                </div>
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

        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/40">
          <p className="text-[11px] text-slate-400 text-center font-medium">
            Data keuangan dikelola oleh Bendahara Karang Taruna Generasi Emas dan diperbarui secara berkala.
          </p>
        </div>
      </div>
    </div>
  );
}