import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { Building2 } from "lucide-react";
import NotificationAlerts from "@/components/admin/NotificationAlerts";
import UpcomingEvents from "@/components/admin/UpcomingEvents";
import DashboardStatsCards from "@/components/admin/DashboardStatsCards";
import DashboardChartsNew from "@/components/admin/DashboardChartsNew";

export const metadata = {
  title: "Dashboard Admin",
};

export default async function AdminDashboard() {
  // ✅ AUTH CHECK: Require admin role
  const session = await requireAdmin();
  const userName = session.user.name || "Admin";
  const userRole = session.user.role === "SUPER_ADMIN" ? "Super Administrator" : "Administrator";

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get date 7 days from now for upcoming events
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Setup rentang 6 bulan terakhir (menghindari bug rollover tanggal 31)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return {
      year,
      month,
      start,
      end,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
    };
  });
  const sixMonthsAgoStart = months[0].start;

  // Parallel data fetching: Hanya 4 kueri database (sebelumnya 24 kueri)
  const [
    activeAnggota,
    transaksi6Bulan,
    kegiatanAktif,
    upcomingEvents,
  ] = await Promise.all([
    // 1. Ambil createdAt anggota aktif (1 query findMany)
    prisma.anggota.findMany({
      where: { status: "AKTIF" },
      select: { createdAt: true },
    }),

    // 2. Ambil transaksi 6 bulan terakhir sekaligus (1 query findMany)
    prisma.transaksiKeuangan.findMany({
      where: {
        tanggal: {
          gte: sixMonthsAgoStart,
          lte: endOfMonth,
        },
      },
      select: {
        jenis: true,
        jumlah: true,
        tanggal: true,
      },
    }),

    // 3. Hitung kegiatan aktif
    prisma.kegiatan.count({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
      },
    }),

    // 4. Agenda kegiatan mendatang (7 hari ke depan, limit 6)
    prisma.kegiatan.findMany({
      where: {
        status: "UPCOMING",
        tanggalMulai: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      orderBy: { tanggalMulai: "asc" },
      take: 6,
      select: {
        id: true,
        nama: true,
        jenis: true,
        tanggalMulai: true,
        lokasi: true,
        thumbnail: true,
        _count: {
          select: { peserta: true },
        },
      },
    }),
  ]);

  // JS Processing: Data Anggota
  const totalAnggotaAktif = activeAnggota.length;
  const anggotaPerBulan = months.map((m) => ({
    bulan: m.label,
    jumlah: activeAnggota.filter((a) => a.createdAt <= m.end).length,
  }));

  // JS Processing: Data Keuangan per bulan
  const keuanganPerBulan = months.map((m) => {
    let pemasukan = 0;
    let pengeluaran = 0;

    for (const t of transaksi6Bulan) {
      const tDate = new Date(t.tanggal);
      if (tDate >= m.start && tDate <= m.end) {
        if (t.jenis === "MASUK") pemasukan += t.jumlah;
        else if (t.jenis === "KELUAR") pengeluaran += t.jumlah;
      }
    }

    return {
      bulan: m.label,
      pemasukan,
      pengeluaran,
    };
  });

  // JS Processing: Metrik bulan berjalan dari transaksi6Bulan
  const currentMonthTransactions = transaksi6Bulan.filter((t) => {
    const d = new Date(t.tanggal);
    return d >= startOfMonth && d <= endOfMonth;
  });
  const monthlyTransactionCount = currentMonthTransactions.length;
  const totalPemasukan = keuanganPerBulan[5]?.pemasukan ?? 0;
  const totalPengeluaran = keuanganPerBulan[5]?.pengeluaran ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                🏛️ Dashboard Sistem Informasi Manajemen
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                Karang Taruna - Sistem Manajemen Terintegrasi
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-600 font-medium">
                    Selamat datang, <span className="font-bold text-slate-900">{userName}</span>
                  </span>
                </div>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Alerts */}
      <NotificationAlerts
        upcomingEvents={upcomingEvents.length}
        upcomingEventName={upcomingEvents[0]?.nama}
        upcomingEventDate={upcomingEvents[0]?.tanggalMulai}
        monthlyTransactions={monthlyTransactionCount}
      />

      {/* Agenda Kegiatan Mendatang */}
      <UpcomingEvents events={upcomingEvents} />

      {/* Visualisasi Data (Charts) */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">📊 Visualisasi Data</h2>
          <p className="text-sm text-slate-500">Analisis tren dan performa organisasi</p>
        </div>
        <DashboardChartsNew
          anggotaData={anggotaPerBulan}
          keuanganData={keuanganPerBulan}
        />
      </div>

      {/* Ringkasan Statistik */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">📊 Ringkasan Statistik</h2>
          <p className="text-sm text-slate-500">Metrik utama organisasi</p>
        </div>
        <DashboardStatsCards
          totalAnggotaAktif={totalAnggotaAktif}
          totalPemasukan={totalPemasukan}
          totalPengeluaran={totalPengeluaran}
          kegiatanAktif={kegiatanAktif}
        />
      </div>
    </div>
  );
}
