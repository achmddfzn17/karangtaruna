import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import {
  Users,
  Calendar,
  CheckCircle2,
  Newspaper,
  FileText,
  ChevronRight,
  Plus,
  Check,
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
  // Auth is already checked by the parent layout — no redirect here to avoid loops
  const session = await auth();
  const userName = session?.user?.name || "Admin";

  // Fetch data
  const [
    totalAnggota, anggotaAktif, totalKegiatan, totalProgram, totalBerita, totalArtikel,
    recentKegiatan, anggotaNonAktif, anggotaAlumni, kegiatanByJenis, allBerita, allArtikel,
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
    // Chart data queries
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
  ]);

  // --- Prepare chart data ---

  // 1. Anggota donut chart
  const anggotaChartData = [
    { name: "Aktif", value: anggotaAktif, color: "#3b82f6" },
    { name: "Non-Aktif", value: anggotaNonAktif, color: "#f59e0b" },
    { name: "Alumni", value: anggotaAlumni, color: "#94a3b8" },
  ].filter((d: any) => d.value > 0);

  // 2. Kegiatan bar chart
  const jenisLabels: Record<string, string> = {
    SOSIAL: "Sosial",
    PENDIDIKAN: "Pendidikan",
    EKONOMI: "Ekonomi",
    OLAHRAGA: "Olahraga",
    SENI_BUDAYA: "Seni & Budaya",
    LAINNYA: "Lainnya",
  };
  const kegiatanChartData = kegiatanByJenis.map((k: any) => ({
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
    const beritaCount = allBerita.filter((b: any) => {
      if (!b.publishedAt) return false;
      const d = new Date(b.publishedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
    const artikelCount = allArtikel.filter((a: any) => {
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
      color: "bg-blue-500",
      sub: `✓ ${anggotaAktif} Aktif`,
      subColor: "text-blue-600",
      href: "/dashboard/anggota",
    },
    {
      label: "Total Kegiatan",
      value: totalKegiatan,
      icon: Calendar,
      color: "bg-blue-500",
      sub: "Semua kegiatan",
      subColor: "text-slate-400",
      href: "/dashboard/kegiatan",
    },
    {
      label: "Total Program",
      value: totalProgram,
      icon: CheckCircle2,
      color: "bg-green-500",
      sub: "Program aktif",
      subColor: "text-slate-400",
      href: "/dashboard/program",
    },
    {
      label: "Total Berita",
      value: totalBerita,
      icon: Newspaper,
      color: "bg-blue-500",
      sub: "Berita published",
      subColor: "text-slate-400",
      href: "/dashboard/berita",
    },
    {
      label: "Total Artikel",
      value: totalArtikel,
      icon: FileText,
      color: "bg-blue-500",
      sub: "Artikel edukasi",
      subColor: "text-slate-400",
      href: "/dashboard/artikel",
    },
  ];

  const quickActions = [
    {
      label: "Tambah Anggota",
      desc: "Daftarkan anggota baru",
      href: "/dashboard/anggota",
    },
    {
      label: "Tambah Kegiatan",
      desc: "Buat kegiatan baru",
      href: "/dashboard/kegiatan",
    },
    {
      label: "Tambah Berita",
      desc: "Publikasi berita baru",
      href: "/dashboard/berita",
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
      <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/40 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-blue-500/30 rounded-full translate-y-1/3" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-[26px] font-extrabold mb-1">
              Selamat Datang Kembali! 👋
            </h1>
            <p className="text-blue-100 text-sm font-medium">
              {userName} - Administrator
            </p>
            <p className="text-blue-200 text-xs mt-1">{dateStr}</p>
          </div>
          <div className="hidden sm:flex flex-col items-center bg-blue-700/60 rounded-xl px-5 py-3 backdrop-blur-sm">
            <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Waktu Server
            </span>
            <span className="text-2xl font-extrabold tracking-wide">
              {timeStr} WIB
            </span>
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
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <Link href={stat.href} className="text-slate-300 hover:text-blue-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 mb-0.5">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className={`text-[11px] font-semibold ${stat.subColor}`}>
                  {stat.sub}
                </span>
                <Link
                  href={stat.href}
                  className="text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Lihat Detail →
                </Link>
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
                  {recentKegiatan.map((k: any) => (
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-colors">
                  <Plus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
