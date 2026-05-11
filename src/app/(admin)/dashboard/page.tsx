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
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get date 7 days from now for upcoming events
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Parallel data fetching
  const [
    totalAnggotaAktif,
    totalPemasukan,
    totalPengeluaran,
    kegiatanAktif,
    upcomingEvents,
    monthlyTransactionCount,
    anggotaPerBulan,
    keuanganPerBulan,
  ] = await Promise.all([
    // Stats Cards Data
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    
    prisma.transaksiKeuangan.aggregate({
      where: {
        jenis: "MASUK",
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { jumlah: true },
    }).then(result => result._sum.jumlah || 0),
    
    prisma.transaksiKeuangan.aggregate({
      where: {
        jenis: "KELUAR",
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { jumlah: true },
    }).then(result => result._sum.jumlah || 0),
    
    prisma.kegiatan.count({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
      },
    }),

    // Upcoming Events (next 7 days, limit 6)
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

    // Monthly transaction count for notification
    prisma.transaksiKeuangan.count({
      where: {
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
    }),

    // Chart Data: Anggota per bulan (last 6 months)
    Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const count = await prisma.anggota.count({
          where: {
            createdAt: { lte: monthEnd },
            status: "AKTIF",
          },
        });

        return {
          bulan: monthDate.toLocaleDateString("id-ID", { month: "short" }),
          jumlah: count,
        };
      })
    ),

    // Chart Data: Keuangan per bulan (last 6 months)
    Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const [pemasukan, pengeluaran] = await Promise.all([
          prisma.transaksiKeuangan.aggregate({
            where: {
              jenis: "MASUK",
              tanggal: { gte: monthStart, lte: monthEnd },
            },
            _sum: { jumlah: true },
          }).then(result => result._sum.jumlah || 0),
          
          prisma.transaksiKeuangan.aggregate({
            where: {
              jenis: "KELUAR",
              tanggal: { gte: monthStart, lte: monthEnd },
            },
            _sum: { jumlah: true },
          }).then(result => result._sum.jumlah || 0),
        ]);

        return {
          bulan: monthDate.toLocaleDateString("id-ID", { month: "short" }),
          pemasukan,
          pengeluaran,
        };
      })
    ),
  ]);

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
