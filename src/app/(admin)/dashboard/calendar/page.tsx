import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Calendar as CalendarIcon, Settings, Newspaper, FileText, Info } from "lucide-react";
import { ContentCalendar } from "@/components/admin/ContentCalendar";

export const metadata = {
  title: "Kalender Konten",
};

export default async function CalendarPage() {
  // ✅ Auth check with helper
  await requireAdmin();

  // Fetch stats for header
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [totalKegiatan, totalBerita, totalArtikel] = await Promise.all([
    prisma.kegiatan.count({
      where: {
        tanggalMulai: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.berita.count({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.artikel.count({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  const totalEvents = totalKegiatan + totalBerita + totalArtikel;
  const currentMonthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <CalendarIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Kalender Konten
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Lihat jadwal kegiatan, berita, dan artikel Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalEvents}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Event Bulan Ini</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Kegiatan</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalKegiatan}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Kegiatan</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Berita</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalBerita}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Berita Published</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-slate-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Artikel</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalArtikel}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Artikel Published</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Kalender Interaktif
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bulan ini: {currentMonthName}
            </p>
          </div>
        </div>

        <div className="p-6">
          <ContentCalendar />
        </div>
      </div>

      {/* Info Section - Legend & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Keterangan Warna</h3>
              <p className="text-xs text-slate-500">Panduan warna untuk setiap tipe event</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Kegiatan</p>
                <p className="text-xs text-slate-500">Agenda dan kegiatan Karang Taruna</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Berita</p>
                <p className="text-xs text-slate-500">Berita terbaru yang dipublikasikan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold text-slate-900">Artikel</p>
                <p className="text-xs text-slate-500">Artikel edukasi dan literasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Konfigurasi Kalender */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Konfigurasi Kalender</h2>
              <p className="text-xs text-slate-600 mt-0.5">Informasi sistem kalender konten</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-xs font-bold text-slate-700">Mode Tampilan</p>
              </div>
              <p className="text-lg font-extrabold text-slate-900">Bulanan</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-bold text-slate-700">Event Bulan Ini</p>
              </div>
              <p className="text-lg font-extrabold text-slate-900">{totalEvents} Event</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
