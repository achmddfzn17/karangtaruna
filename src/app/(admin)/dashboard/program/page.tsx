import { prisma } from "@/lib/prisma";
import { Layers, Plus, Check, X, Eye, Pencil, Search, Settings, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { deleteProgram } from "./actions";
import { Program, Prisma } from "@prisma/client";
import { DeleteProgramButton } from "@/components/admin/DeleteProgramButton";
import { requireAdmin } from "@/lib/auth-helpers";

export const metadata = { title: "Data Program" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function DataProgramPage({ searchParams }: PageProps) {
  // Auth check
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const statusFilter = params.status ?? "SEMUA";

  // Build where condition with proper typing
  const where: Prisma.ProgramWhereInput = {};
  if (q) {
    where.nama = { contains: q, mode: "insensitive" };
  }
  if (statusFilter === "AKTIF") {
    where.status = true;
  } else if (statusFilter === "NONAKTIF") {
    where.status = false;
  }

  // Fetch data with stats - parallel queries
  const [programList, totalAktif, totalNonaktif] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: { urutan: "asc" },
    }),
    prisma.program.count({ where: { status: true } }),
    prisma.program.count({ where: { status: false } }),
  ]);

  const totalAll = totalAktif + totalNonaktif;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Program
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola program kerja dan inisiatif Karang Taruna
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
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data program</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Program */}
            <Link
              href="/dashboard/program/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              aria-label="Tambah Program Baru"
            >
              <Plus className="w-4 h-4" />
              Tambah Program
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
                  placeholder="Cari nama program..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
                  aria-label="Cari program"
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
                  href={`/dashboard/program?status=${statusFilter}`}
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
                href={`/dashboard/program?status=SEMUA${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "SEMUA"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua ({totalAll})
              </Link>
              <Link
                href={`/dashboard/program?status=AKTIF${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "AKTIF"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Aktif ({totalAktif})
              </Link>
              <Link
                href={`/dashboard/program?status=NONAKTIF${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "NONAKTIF"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Nonaktif ({totalNonaktif})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Program</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAktif}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Program Aktif</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <X className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Nonaktif</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalNonaktif}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Program Nonaktif</p>
        </div>
      </div>

      {/* Tabel Data Program */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Tabel Data Program
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Menampilkan {programList.length} dari {totalAll} program
                {(q || statusFilter !== "SEMUA") && " (difilter)"}
              </p>
            </div>
          </div>
        </div>

        {programList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Layers className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Program</p>
            <p className="text-sm text-slate-500">
              {q || statusFilter !== "SEMUA"
                ? "Tidak ada program yang sesuai filter"
                : "Mulai tambahkan program baru"}
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programList.map((p: Program) => (
              <div
                key={p.id}
                className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                {/* Urutan Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/30">
                    {p.urutan}
                  </div>
                  {p.status ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                      AKTIF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[10px] font-bold">
                      <X className="w-3 h-3" />
                      NONAKTIF
                    </span>
                  )}
                </div>

                {/* Thumbnail */}
                {p.thumbnail ? (
                  <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={p.thumbnail}
                      alt={p.nama}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Layers className="w-10 h-10 text-blue-400" />
                  </div>
                )}

                {/* Name */}
                <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[40px]">
                  {p.nama}
                </h3>

                {/* Description */}
                {p.deskripsi && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3 min-h-[48px]">
                    {p.deskripsi}
                  </p>
                )}

                {/* Icon Display */}
                {p.icon && (
                  <div className="mb-4 p-2 bg-blue-50 rounded-lg inline-flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-bold">Icon: {p.icon}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href="/program"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    aria-label={`Lihat program ${p.nama}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat
                  </Link>
                  <Link
                    href={`/dashboard/program/edit/${p.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors"
                    aria-label={`Edit program ${p.nama}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <DeleteProgramButton 
                    action={deleteProgram.bind(null, p.id)} 
                    programId={p.id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Konfigurasi Data Program */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Program</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data program</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Data Tersimpan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Program</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Program Aktif</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAktif} Program</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Program Nonaktif</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalNonaktif} Program</p>
          </div>
        </div>
      </div>
    </div>
  );
}
