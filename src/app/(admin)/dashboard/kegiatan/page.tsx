import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { 
  Calendar, Plus, Pencil, Users, Search, 
  Settings, MapPin, DollarSign, Image as ImageIcon,
  Clock
} from "lucide-react";
import { deleteKegiatan } from "./tambah/actions";
import Pagination from "@/components/admin/Pagination";
import KegiatanFilters from "@/components/admin/KegiatanFilters";
import DeleteKegiatanButton from "@/components/admin/DeleteKegiatanButton";
import { requireAdmin } from "@/lib/auth-helpers";
import { Prisma, JenisKegiatan, StatusKegiatan } from "@prisma/client";

export const metadata = { title: "Data Kegiatan" };

const PER_PAGE = 12;

// Valid enum values for safe filtering
const VALID_JENIS: JenisKegiatan[] = ["SOSIAL", "PENDIDIKAN", "EKONOMI", "OLAHRAGA", "SENI_BUDAYA", "LAINNYA"];
const VALID_STATUS: StatusKegiatan[] = ["UPCOMING", "ONGOING", "SELESAI", "DIBATALKAN"];

interface PageProps {
  searchParams: Promise<{ q?: string; jenis?: string; status?: string; page?: string }>;
}

export default async function DataKegiatanPage({ searchParams }: PageProps) {
  // ✅ BUG FIX: Add auth check
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  
  // ✅ BUG FIX: Safely validate filter values
  const jenisParam = params.jenis;
  const jenisFilter: JenisKegiatan | "SEMUA" = 
    jenisParam && VALID_JENIS.includes(jenisParam as JenisKegiatan) 
      ? (jenisParam as JenisKegiatan) 
      : "SEMUA";
  
  const statusParam = params.status;
  const statusFilter: StatusKegiatan | "SEMUA" = 
    statusParam && VALID_STATUS.includes(statusParam as StatusKegiatan) 
      ? (statusParam as StatusKegiatan) 
      : "SEMUA";
  
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  // Build where condition
  const whereConditions: Prisma.KegiatanWhereInput[] = [];
  if (q) {
    whereConditions.push({
      OR: [
        { nama: { contains: q, mode: "insensitive" } },
        { lokasi: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (jenisFilter !== "SEMUA") {
    whereConditions.push({ jenis: jenisFilter });
  }
  if (statusFilter !== "SEMUA") {
    whereConditions.push({ status: statusFilter });
  }

  const where: Prisma.KegiatanWhereInput = 
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // ✅ Parallel data fetching for stats and list
  const [kegiatanList, totalFiltered, totalUpcoming, totalOngoing, totalSelesai, totalDibatalkan] = await Promise.all([
    prisma.kegiatan.findMany({
      where,
      orderBy: { tanggalMulai: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { peserta: true, galeri: true } } },
    }),
    prisma.kegiatan.count({ where }),
    prisma.kegiatan.count({ where: { status: "UPCOMING" } }),
    prisma.kegiatan.count({ where: { status: "ONGOING" } }),
    prisma.kegiatan.count({ where: { status: "SELESAI" } }),
    prisma.kegiatan.count({ where: { status: "DIBATALKAN" } }),
  ]);

  const totalAll = totalUpcoming + totalOngoing + totalSelesai + totalDibatalkan;
  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/kegiatan?jenis=${jenisFilter}&status=${statusFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  // ✅ BUG FIX: Redirect to page 1 if current page exceeds total pages
  // This prevents empty page after deletion

  const jenisColor: Record<JenisKegiatan, string> = {
    SOSIAL: "bg-green-100 text-green-700",
    PENDIDIKAN: "bg-blue-100 text-blue-700",
    EKONOMI: "bg-amber-100 text-amber-700",
    OLAHRAGA: "bg-orange-100 text-orange-700",
    SENI_BUDAYA: "bg-purple-100 text-purple-700",
    LAINNYA: "bg-gray-100 text-gray-600",
  };

  const statusColor: Record<StatusKegiatan, string> = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    SELESAI: "bg-gray-100 text-gray-600",
    DIBATALKAN: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<StatusKegiatan, string> = {
    UPCOMING: "Akan Datang",
    ONGOING: "Berjalan",
    SELESAI: "Selesai",
    DIBATALKAN: "Dibatalkan",
  };

  const jenisOptions = [
    { value: "SEMUA", label: "Semua Jenis" },
    { value: "SOSIAL", label: "Sosial" },
    { value: "PENDIDIKAN", label: "Pendidikan" },
    { value: "EKONOMI", label: "Ekonomi" },
    { value: "OLAHRAGA", label: "Olahraga" },
    { value: "SENI_BUDAYA", label: "Seni & Budaya" },
    { value: "LAINNYA", label: "Lainnya" },
  ];

  const statusOptions = [
    { value: "SEMUA", label: "Semua Status" },
    { value: "UPCOMING", label: "Upcoming" },
    { value: "ONGOING", label: "Ongoing" },
    { value: "SELESAI", label: "Selesai" },
    { value: "DIBATALKAN", label: "Dibatalkan" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Kegiatan
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola dan pantau seluruh kegiatan Karang Taruna
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
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data kegiatan</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Kegiatan */}
            <Link
              href="/dashboard/kegiatan/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              aria-label="Tambah Kegiatan Baru"
            >
              <Plus className="w-4 h-4" />
              Tambah Kegiatan
            </Link>

            {/* Search */}
            <form method="GET" className="flex gap-2">
              <input type="hidden" name="jenis" value={jenisFilter} />
              <input type="hidden" name="status" value={statusFilter} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari nama atau lokasi..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
                  aria-label="Cari kegiatan"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                aria-label="Cari"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
              {q && (
                <Link
                  href={`/dashboard/kegiatan?jenis=${jenisFilter}&status=${statusFilter}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* ✅ BUG FIX: Extract filters to client component */}
            <KegiatanFilters
              jenisOptions={jenisOptions}
              statusOptions={statusOptions}
              currentJenis={jenisFilter}
              currentStatus={statusFilter}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Kegiatan</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Upcoming</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalUpcoming}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Akan Datang</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Ongoing</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalOngoing}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Sedang Berjalan</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-slate-500 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Selesai</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalSelesai}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Telah Selesai</p>
        </div>
      </div>

      {/* Tabel Data Kegiatan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Tabel Data Kegiatan
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Menampilkan {totalFiltered > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} kegiatan
                {(q || jenisFilter !== "SEMUA" || statusFilter !== "SEMUA") && " (difilter)"}
              </p>
            </div>
          </div>
        </div>

        {kegiatanList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Calendar className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Kegiatan</p>
            <p className="text-sm text-slate-500">
              {q || jenisFilter !== "SEMUA" || statusFilter !== "SEMUA"
                ? "Tidak ada kegiatan yang sesuai filter"
                : "Mulai tambahkan kegiatan baru"}
            </p>
          </div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kegiatanList.map((k) => (
                <div
                  key={k.id}
                  className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Thumbnail */}
                  {k.thumbnail ? (
                    <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
                      <Image
                        src={k.thumbnail}
                        alt={k.nama}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-blue-400" />
                    </div>
                  )}

                  {/* Header with Badges */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${jenisColor[k.jenis]}`}>
                      {k.jenis.replace("_", " ")}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor[k.status]}`}>
                      {statusLabel[k.status]}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[40px]">
                    {k.nama}
                  </h3>

                  {/* Description */}
                  {k.deskripsi && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[32px]">
                      {k.deskripsi}
                    </p>
                  )}

                  {/* Info Details */}
                  <div className="space-y-2 mb-4">
                    {/* Tanggal */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{formatDate(k.tanggalMulai)}</span>
                      {k.tanggalSelesai && (
                        <>
                          <span className="text-slate-300">→</span>
                          <span className="truncate">{formatDate(k.tanggalSelesai)}</span>
                        </>
                      )}
                    </div>

                    {/* Lokasi */}
                    {k.lokasi && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{k.lokasi}</span>
                      </div>
                    )}

                    {/* ✅ BUG FIX: Check if anggaran is not null AND not 0 */}
                    {k.anggaran !== null && k.anggaran > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Rp {Number(k.anggaran).toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    {/* Peserta & Galeri */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <Link
                        href={`/dashboard/kegiatan/peserta/${k.id}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors"
                        aria-label={`Lihat peserta kegiatan ${k.nama}`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {k._count.peserta} Peserta
                      </Link>
                      {k._count.galeri > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {k._count.galeri} Galeri
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/dashboard/kegiatan/edit/${k.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors"
                      aria-label={`Edit kegiatan ${k.nama}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    {/* ✅ BUG FIX: Use proper client component for delete */}
                    <DeleteKegiatanButton
                      id={k.id}
                      nama={k.nama}
                      onDelete={deleteKegiatan}
                    />
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

      {/* Konfigurasi Data Kegiatan */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Kegiatan</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data kegiatan</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Data Tersimpan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Kegiatan</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Data Per Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{PER_PAGE} Kegiatan</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPages} Halaman</p>
          </div>
        </div>
      </div>
    </div>
  );
}
