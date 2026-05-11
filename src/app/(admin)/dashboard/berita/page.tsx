import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { 
  Newspaper, Plus, Eye, Pencil, Search, Filter, 
  Settings, Calendar, FileText, CheckCircle2, Archive, Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { deleteBerita } from "./actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import Pagination from "@/components/admin/Pagination";
import { Prisma, StatusPublish } from "@prisma/client";

export const metadata = { title: "Data Berita" };

const PER_PAGE = 12;

// Valid enum values for safe filtering
const VALID_STATUS: StatusPublish[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function DataBeritaPage({ searchParams }: PageProps) {
  // ✅ Auth check
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  
  // ✅ Safely validate status filter
  const statusParam = params.status;
  const statusFilter: StatusPublish | "SEMUA" = 
    statusParam && VALID_STATUS.includes(statusParam as StatusPublish)
      ? (statusParam as StatusPublish)
      : "SEMUA";
  
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  // Build where condition
  const whereConditions: Prisma.BeritaWhereInput[] = [];
  if (q) {
    whereConditions.push({
      OR: [
        { judul: { contains: q, mode: "insensitive" } },
        { ringkasan: { contains: q, mode: "insensitive" } },
        { kategori: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (statusFilter !== "SEMUA") {
    whereConditions.push({ status: statusFilter });
  }

  const where: Prisma.BeritaWhereInput = 
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Parallel queries for stats and data
  const [beritaList, totalFiltered, totalDraft, totalPublished, totalArchived] = await Promise.all([
    prisma.berita.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.berita.count({ where }),
    prisma.berita.count({ where: { status: "DRAFT" } }),
    prisma.berita.count({ where: { status: "PUBLISHED" } }),
    prisma.berita.count({ where: { status: "ARCHIVED" } }),
  ]);

  const totalAll = totalDraft + totalPublished + totalArchived;
  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/berita?status=${statusFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const statusColor: Record<StatusPublish, string> = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-slate-100 text-slate-600",
  };

  const statusLabel: Record<StatusPublish, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Berita
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola pemberitaan dan informasi terbaru Karang Taruna
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
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data berita</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Berita */}
            <Link
              href="/dashboard/berita/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              aria-label="Tambah Berita Baru"
            >
              <Plus className="w-4 h-4" />
              Tambah Berita
            </Link>

            {/* Search */}
            <form method="GET" className="flex gap-2">
              <input type="hidden" name="status" value={statusFilter} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari judul, ringkasan, kategori..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
                  aria-label="Cari berita"
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
                  href={`/dashboard/berita?status=${statusFilter}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* Filter Status */}
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-slate-500" />
              <Link
                href={`/dashboard/berita?status=SEMUA${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "SEMUA"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua ({totalAll})
              </Link>
              <Link
                href={`/dashboard/berita?status=DRAFT${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "DRAFT"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Draft ({totalDraft})
              </Link>
              <Link
                href={`/dashboard/berita?status=PUBLISHED${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "PUBLISHED"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Published ({totalPublished})
              </Link>
              <Link
                href={`/dashboard/berita?status=ARCHIVED${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "ARCHIVED"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Archived ({totalArchived})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Berita</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Draft</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalDraft}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Draft</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPublished}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Published</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-slate-500 rounded-xl">
              <Archive className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Archived</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalArchived}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Archived</p>
        </div>
      </div>

      {/* Tabel Data Berita */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              Tabel Data Berita
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {totalFiltered > 0 ? (page - 1) * PER_PAGE + 1 : 0}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} berita
              {(q || statusFilter !== "SEMUA") && " (difilter)"}
            </p>
          </div>
        </div>

        {beritaList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Newspaper className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Berita</p>
            <p className="text-sm text-slate-500">
              {q || statusFilter !== "SEMUA"
                ? "Tidak ada berita yang sesuai filter"
                : "Mulai tambahkan berita baru"}
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beritaList.map((b) => (
                <div
                  key={b.id}
                  className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Thumbnail */}
                  {b.thumbnail ? (
                    <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden">
                      <Image
                        src={b.thumbnail}
                        alt={b.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-blue-400" />
                    </div>
                  )}

                  {/* Status & Kategori */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    {b.kategori && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                        {b.kategori}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ml-auto ${statusColor[b.status]}`}>
                      {statusLabel[b.status]}
                    </span>
                  </div>

                  {/* Judul */}
                  <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[40px]">
                    {b.judul}
                  </h3>

                  {/* Ringkasan */}
                  {b.ringkasan && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[32px]">
                      {b.ringkasan}
                    </p>
                  )}

                  {/* Info Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{formatDate(b.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Eye className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{b.viewCount.toLocaleString("id-ID")} views</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    {b.status === "PUBLISHED" && (
                      <Link
                        href={`/berita/${b.slug}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                        aria-label={`Lihat berita ${b.judul}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/berita/edit/${b.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors"
                      aria-label={`Edit berita ${b.judul}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <DeleteConfirmButton
                      id={b.id}
                      name={b.judul}
                      onDelete={deleteBerita}
                      itemType="berita"
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

      {/* Konfigurasi Data Berita */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Berita</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data berita</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Data Tersimpan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Berita</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Data Per Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{PER_PAGE} Berita</p>
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
