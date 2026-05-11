import { Users, TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface DashboardStatsCardsProps {
  totalAnggotaAktif: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  kegiatanAktif: number;
}

export default function DashboardStatsCards({
  totalAnggotaAktif,
  totalPemasukan,
  totalPengeluaran,
  kegiatanAktif,
}: DashboardStatsCardsProps) {
  const stats = [
    {
      label: "Total Anggota Aktif",
      value: totalAnggotaAktif,
      icon: Users,
      gradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      badge: "Total",
      badgeColor: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      label: "Total Pemasukan",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(totalPemasukan),
      icon: TrendingUp,
      gradient: "from-green-50 to-green-100/50",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      badge: "Bulan Ini",
      badgeColor: "bg-green-100 text-green-600 border-green-200",
    },
    {
      label: "Total Pengeluaran",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(totalPengeluaran),
      icon: TrendingDown,
      gradient: "from-red-50 to-red-100/50",
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
      badge: "Bulan Ini",
      badgeColor: "bg-red-100 text-red-600 border-red-200",
    },
    {
      label: "Agenda Kegiatan Aktif",
      value: kegiatanAktif,
      icon: Calendar,
      gradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      badge: "Aktif",
      badgeColor: "bg-blue-100 text-blue-600 border-blue-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 border border-slate-200/50 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 ${stat.iconBg} rounded-xl shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full border ${stat.badgeColor}`}
              >
                {stat.badge}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
