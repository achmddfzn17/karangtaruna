import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import {
  Users,
  Calendar,
  Newspaper,
  ChevronRight,
  MessageSquare,
  Vote as VoteIcon,
  Wallet,
  Zap,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  AnggotaStatusChart,
  KegiatanJenisChart,
  KontenTrenChart,
} from "@/components/admin/DashboardCharts";

export const metadata = {
  title: "Dashboard Admin",
};

export default async function AdminDashboard() {
  // ✅ AUTH CHECK: Require admin role (ADMIN or SUPER_ADMIN)
  // Will redirect to /login if not authenticated
  // Will redirect to /member if authenticated but not admin
  const session = await requireAdmin();
  const userName = session.user.name || "Admin";

  // Fetch data
  const [
    totalAnggota, anggotaAktif, totalKegiatan, totalProgram, totalBerita, totalArtikel,
    recentKegiatan, anggotaNonAktif, anggotaAlumni, kegiatanByJenis, allBerita, allArtikel,
    totalAspirasi, totalPolling, pendingAspirasi, totalSaldo
  ] = await Promise.all([
    prisma.anggota.count(),
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    prisma.kegiatan.count(),
    prisma.program.count(),
    prisma.berita.count({ where: { status: "PUBLISHED" } }),
    prisma.artikel.count({ where: { status: "PUBLISHED" } }),
    prisma.kegiatan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, nama: true, jenis: true, tanggalMulai: true, status: true, deskripsi: true },
    }),
    prisma.anggota.count({ where: { status: "NON_AKTIF" } }),
    prisma.anggota.count({ where: { status: "ALUMNI" } }),
    prisma.kegiatan.groupBy({ by: ["jenis"], _count: { id: true } }),
    prisma.berita.findMany({
      where: { status: "PUBLISHED" },
      select: { publishedAt: true },
    }),
    prisma.artikel.findMany({
      where: { status: "PUBLISHED" },
      select: { publishedAt: true },
    }),
    prisma.aspirasi.count(),
    prisma.polling.count(),
    prisma.aspirasi.count({ where: { status: "PENDING" } }),
    prisma.transaksiKeuangan.findMany({
      select: { jumlah: true, jenis: true }
    }).then(transactions => 
      transactions.reduce((acc, t) => t.jenis === "MASUK" ? acc + t.jumlah : acc - t.jumlah, 0)
    )
  ]);

  // --- Prepare chart data ---

  // 1. Anggota donut chart
  const anggotaChartData = [
    { name: "Aktif", value: anggotaAktif, color: "#3b82f6" },
    { name: "Non-Aktif", value: anggotaNonAktif, color: "#f59e0b" },
    { name: "Alumni", value: anggotaAlumni, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  // 2. Kegiatan bar chart
  const jenisLabels: Record<string, string> = {
    SOSIAL: "Sosial",
    PENDIDIKAN: "Pendidikan",
    EKONOMI: "Ekonomi",
    OLAHRAGA: "Olahraga",
    SENI_BUDAYA: "Seni & Budaya",
    LAINNYA: "Lainnya",
  };
  const kegiatanChartData = kegiatanByJenis.map((k) => ({
    name: jenisLabels[k.jenis] || k.jenis,
    jumlah: k._count.id,
  }));

  // 3. Konten tren area chart (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const kontenTrenData = months.map(({ year, month }) => {
    const beritaCount = allBerita.filter((b) => {
      if (!b.publishedAt) return false;
      const d = new Date(b.publishedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    const artikelCount = allArtikel.filter((a) => {
      if (!a.publishedAt) return false;
      const d = new Date(a.publishedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    return { bulan: `${monthNames[month]} ${year}`, berita: beritaCount, artikel: artikelCount };
  });

  // Server time
  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const stats = [
    {
      label: "Total Anggota",
      value: totalAnggota,
      icon: Users,
      color: "bg-blue-600 shadow-blue-500/20",
      sub: `${anggotaAktif} Aktif`,
      subColor: "text-blue-600",
      href: "/dashboard/anggota",
    },
    {
      label: "Keuangan (Saldo)",
      value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumSignificantDigits: 3 }).format(totalSaldo),
      icon: Wallet,
      color: "bg-green-600 shadow-green-500/20",
      sub: "Saldo saat ini",
      subColor: "text-green-600",
      href: "/dashboard/keuangan",
    },
    {
      label: "Aspirasi Masuk",
      value: totalAspirasi,
      icon: MessageSquare,
      color: "bg-purple-600 shadow-purple-500/20",
      sub: `${pendingAspirasi} Menunggu`,
      subColor: "text-purple-600",
      href: "/dashboard/aspirasi",
    },
    {
      label: "Voting Aktif",
      value: totalPolling,
      icon: VoteIcon,
      color: "bg-orange-600 shadow-orange-500/20",
      sub: "E-Voting digital",
      subColor: "text-orange-600",
      href: "/dashboard/voting",
    },
    {
      label: "Kegiatan",
      value: totalKegiatan,
      icon: Calendar,
      color: "bg-sky-600 shadow-sky-500/20",
      sub: "Total aktivitas",
      subColor: "text-sky-600",
      href: "/dashboard/kegiatan",
    },
  ];

  const quickActions = [
    {
      label: "Tambah Kegiatan",
      desc: "Buat agenda baru",
      href: "/dashboard/kegiatan",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Buat E-Voting",
      desc: "Mulai pemungutan suara",
      href: "/dashboard/voting",
      icon: VoteIcon,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Update Berita",
      desc: "Publikasi info terbaru",
      href: "/dashboard/berita",
      icon: Newspaper,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const jenisColor: Record<string, string> = {
    PENDIDIKAN: "bg-blue-100 text-blue-700",
    SOSIAL: "bg-green-100 text-green-700",
    OLAHRAGA: "bg-orange-100 text-orange-700",
    SENI: "bg-purple-100 text-purple-700",
    LINGKUNGAN: "bg-emerald-100 text-emerald-700",
    KEAGAMAAN: "bg-amber-100 text-amber-700",
    LAINNYA: "bg-gray-100 text-gray-700",
  };

  const statusColor: Record<string, string> = {
    RENCANA: "bg-yellow-100 text-yellow-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    SELESAI: "bg-gray-100 text-gray-600",
    BATAL: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
              <Zap className="w-8 h-8 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                Halo, {userName}!
              </h1>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">
                Administrator Panel • Generasi Emas
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-blue-200 text-xs font-medium">{dateStr}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end bg-black/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
              <span className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1 opacity-60">
                Server Time
              </span>
              <span className="text-2xl font-black tracking-tighter">
                {timeStr} <span className="text-sm font-bold opacity-60 ml-1">WIB</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Link href={stat.href} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase tracking-tight ${stat.subColor}`}>
                  {stat.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnggotaStatusChart data={anggotaChartData} />
        <KegiatanJenisChart data={kegiatanChartData} />
        <KontenTrenChart data={kontenTrenData} />
      </div>

      {/* Bottom Grid: Recent + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kegiatan Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Kegiatan Terbaru</h2>
            <Link
              href="/dashboard/kegiatan"
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          {recentKegiatan.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Belum ada kegiatan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider pb-3 px-2">
                      Nama Kegiatan
                    </th>
                    <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider pb-3 px-2">
                      Jenis
                    </th>
                    <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider pb-3 px-2">
                      Tanggal
                    </th>
                    <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider pb-3 px-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentKegiatan.map((k) => (
                    <tr
                      key={k.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-2">
                        <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {k.deskripsi || "-"}
                        </p>
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            jenisColor[k.jenis] || jenisColor.LAINNYA
                          }`}
                        >
                          {k.jenis.charAt(0) + k.jenis.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-sm text-slate-500">
                        {formatDate(k.tanggalMulai)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            statusColor[k.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {k.status.charAt(0) + k.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Aksi Cepat</h2>
          </div>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-5 p-5 rounded-2xl border border-slate-50 bg-slate-50/30 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{action.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-slate-900 rounded-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl group-hover:bg-blue-500/40 transition-all" />
            <div className="relative z-10">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Butuh Bantuan?</p>
              <p className="text-white text-sm font-bold leading-snug">Panduan Lengkap Penggunaan Dashboard Admin</p>
              <button className="mt-4 text-[11px] font-black text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Buka Dokumentasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
