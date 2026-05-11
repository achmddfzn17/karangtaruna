import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import { Award, Search, Settings, Calendar, User, FileText, QrCode, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Pagination from "@/components/admin/Pagination";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Manajemen Sertifikat",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SertifikatPage({ searchParams }: PageProps) {
  // Auth check - using requireAdmin helper
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);
  const PER_PAGE = 12;

  // Build where condition with proper typing
  const where: Prisma.SertifikatWhereInput = q
    ? {
        OR: [
          { namaAnggota: { contains: q, mode: "insensitive" } },
          { namaKegiatan: { contains: q, mode: "insensitive" } },
          { nomorSertifikat: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  // Parallel data fetching with stats
  const [sertifikatList, totalFiltered, totalThisMonth, totalThisYear] = await Promise.all([
    prisma.sertifikat.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sertifikat.count({ where }),
    prisma.sertifikat.count({
      where: {
        tanggalTerbit: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.sertifikat.count({
      where: {
        tanggalTerbit: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/sertifikat${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Sertifikat
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola dan pantau sertifikat kegiatan Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Pengelolaan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Tombol Pengelolaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data sertifikat</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <form method="GET" className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari nomor, nama, kegiatan..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-80"
                  aria-label="Cari sertifikat"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                aria-label="Cari"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
              {q && (
                <Link
                  href="/dashboard/sertifikat"
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalFiltered}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Sertifikat</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Bulan Ini</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalThisMonth}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Diterbitkan Bulan Ini</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Tahun Ini</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalThisYear}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Diterbitkan Tahun Ini</p>
        </div>
      </div>

      {/* Tabel Data Sertifikat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Tabel Data Sertifikat
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Menampilkan {totalFiltered > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} sertifikat
                {q && " (difilter)"}
              </p>
            </div>
          </div>
        </div>

        {sertifikatList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Award className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Sertifikat</p>
            <p className="text-sm text-slate-500">
              {q ? "Tidak ada sertifikat yang sesuai pencarian" : "Sertifikat akan muncul setelah kegiatan selesai"}
            </p>
          </div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sertifikatList.map((cert) => (
                <div
                  key={cert.id}
                  className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Header with QR Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          Sertifikat
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono break-all">
                        {cert.nomorSertifikat}
                      </p>
                    </div>
                    {cert.qrCode && (
                      <div className="p-2 bg-blue-50 rounded-lg ml-2 flex-shrink-0">
                        <QrCode className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Nama Anggota */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Nama Anggota</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {cert.namaAnggota}
                    </h3>
                  </div>

                  {/* Nama Kegiatan */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">Kegiatan</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2 min-h-[40px]">
                      {cert.namaKegiatan}
                    </p>
                  </div>

                  {/* Tanggal Terbit */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Terbit: {formatDate(cert.tanggalTerbit)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {cert.qrCode && (
                        <a
                          href={cert.qrCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                          aria-label={`Lihat QR Code sertifikat ${cert.nomorSertifikat}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR Code
                        </a>
                      )}
                      <Link
                        href={`/verify/${cert.nomorSertifikat}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg transition-colors"
                        aria-label={`Verifikasi sertifikat ${cert.nomorSertifikat}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verifikasi
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Halaman {page} dari {totalPages}
                </p>
                <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Konfigurasi Data Sertifikat */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Sertifikat</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data sertifikat</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Data Tersimpan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalFiltered} Sertifikat</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Data Per Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{PER_PAGE} Sertifikat</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPages} Halaman</p>
          </div>
        </div>
      </div>
    </div>
  );
}
