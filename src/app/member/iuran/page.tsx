import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import IuranList from "@/components/member/IuranList";
import BayarIuranButton from "@/components/member/BayarIuranButton";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Iuran Anggota | Portal Anggota",
};

export default async function IuranPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  // Get anggota data
  const anggota = await prisma.anggota.findUnique({
    where: { userId: session.user.id },
    include: {
      iuran: {
        orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
      },
    },
  });

  if (!anggota) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Data anggota tidak ditemukan</p>
      </div>
    );
  }

  // Current month & year
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Check if current month is paid
  const currentMonthIuran = anggota.iuran.find(
    (i) => i.bulan === currentMonth && i.tahun === currentYear
  );

  // Calculate statistics
  const totalPaid = anggota.iuran.length;
  const totalAmount = anggota.iuran.reduce((sum, i) => sum + i.jumlah, 0);
  const thisYearPaid = anggota.iuran.filter((i) => i.tahun === currentYear).length;

  // Generate last 12 months
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - 1 - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const iuran = anggota.iuran.find((i) => i.bulan === month && i.tahun === year);
    return {
      month,
      year,
      monthName: date.toLocaleDateString("id-ID", { month: "long" }),
      iuran,
      isPaid: !!iuran,
    };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-blue-600" />
          Iuran Anggota
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Riwayat pembayaran iuran bulanan Anda
        </p>
      </div>

      {/* Status Alert */}
      {currentMonthIuran ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-900 text-sm">
              Iuran Bulan Ini Sudah Lunas
            </h3>
            <p className="text-xs text-green-700 mt-1">
              Terima kasih telah membayar iuran bulan{" "}
              {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 text-sm">
              Iuran Bulan Ini Belum Dibayar
            </h3>
            <p className="text-xs text-orange-700 mt-1">
              Silakan lakukan pembayaran iuran bulan{" "}
              {now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          </div>
          <BayarIuranButton
              bulanNama={now.toLocaleDateString("id-ID", { month: "long" })}
              tahun={currentYear}
            />
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Total Pembayaran
            </p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPaid}</p>
          <p className="text-xs text-slate-400 mt-1">Bulan terbayar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Total Nominal
            </p>
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Seluruh periode</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Tahun Ini
            </p>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {thisYearPaid}/12
          </p>
          <p className="text-xs text-slate-400 mt-1">Bulan terbayar</p>
        </div>
      </div>

      {/* 12 Months Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Status 12 Bulan Terakhir
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {last12Months.map((item) => (
            <div
              key={`${item.year}-${item.month}`}
              className={`p-3 rounded-xl border-2 transition-all ${
                item.isPaid
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">
                  {item.monthName.slice(0, 3)}
                </span>
                {item.isPaid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <p className="text-[10px] text-slate-400">{item.year}</p>
              {item.iuran && (
                <p className="text-xs font-bold text-green-700 mt-1">
                  {formatCurrency(item.iuran.jumlah)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Riwayat Pembayaran */}
      <IuranList iuranList={anggota.iuran} />
    </div>
  );
}
