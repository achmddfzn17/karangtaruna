import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { 
  Users, Plus, Phone, Mail, Pencil, Search, 
  Filter, UserPlus, Settings,
  Calendar, MapPin, Briefcase
} from "lucide-react";
import { ExportAnggotaButton } from "@/components/admin/ExportAnggotaButton";
import DeleteAnggotaButton from "@/components/admin/DeleteAnggotaButton";
import Pagination from "@/components/admin/Pagination";
import { Prisma, StatusAnggota } from "@prisma/client";

export const metadata = { title: "Data Anggota" };

const PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function DataAnggotaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const statusFilter = (params.status as StatusAnggota | "SEMUA") ?? "SEMUA";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: Prisma.AnggotaWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { namaLengkap: { contains: q, mode: "insensitive" } },
              { nik: { contains: q, mode: "insensitive" } },
              { noHp: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      statusFilter !== "SEMUA" ? { status: statusFilter } : {},
    ],
  };

  const [anggotaList, totalFiltered, totalAktif, totalNonAktif, totalAlumni] = await Promise.all([
    prisma.anggota.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.anggota.count({ where }),
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    prisma.anggota.count({ where: { status: "NON_AKTIF" } }),
    prisma.anggota.count({ where: { status: "ALUMNI" } }),
  ]);

  const totalAll = totalAktif + totalNonAktif + totalAlumni;
  const totalPages = Math.ceil(totalFiltered / PER_PAGE);
  const baseUrl = `/dashboard/anggota?status=${statusFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const statusColor: Record<StatusAnggota, string> = {
    AKTIF: "bg-green-100 text-green-700",
    NON_AKTIF: "bg-red-100 text-red-700",
    ALUMNI: "bg-slate-200 text-slate-700",
  };

  const genderLabel: Record<string, string> = {
    LAKI_LAKI: "Laki-laki",
    PEREMPUAN: "Perempuan",
  };

  const filterTabs = [
    { label: "Semua", value: "SEMUA", count: totalAll },
    { label: "Aktif", value: "AKTIF", count: totalAktif },
    { label: "Non-Aktif", value: "NON_AKTIF", count: totalNonAktif },
    { label: "Alumni", value: "ALUMNI", count: totalAlumni },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Anggota
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola dan pantau data seluruh anggota Karang Taruna
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
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Anggota</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAktif}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Anggota Aktif</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Non-Aktif</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalNonAktif}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Non-Aktif</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Alumni</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAlumni}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Alumni</p>
        </div>
      </div>

      {/* Tombol Pengelolaan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Tombol Pengelolaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data anggota</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Anggota */}
            <Link
              href="/dashboard/anggota/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Anggota
            </Link>

            {/* Cari Anggota */}
            <form method="GET" className="flex gap-2">
              <input type="hidden" name="status" value={statusFilter} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari nama, NIK, HP..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Cari Anggota
              </button>
              {q && (
                <Link
                  href={`/dashboard/anggota?status=${statusFilter}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* Filter Status */}
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-slate-500" />
              {filterTabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={`/dashboard/anggota?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    statusFilter === tab.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 text-xs ${statusFilter === tab.value ? "opacity-80" : "opacity-60"}`}>
                    ({tab.count})
                  </span>
                </Link>
              ))}
            </div>

            {/* Export Excel */}
            <div className="ml-auto">
              <ExportAnggotaButton data={anggotaList} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Anggota</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">NIK</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Jenis Kelamin</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Kontak</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Tanggal Gabung</th>
                <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anggotaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      {q || statusFilter !== "SEMUA"
                        ? "Tidak ada anggota yang sesuai filter"
                        : "Belum ada data anggota"}
                    </p>
                  </td>
                </tr>
              ) : (
                anggotaList.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {a.foto ? (
                          <div className="relative w-9 h-9">
                            <Image
                              src={a.foto}
                              alt={a.namaLengkap}
                              fill
                              className="rounded-full object-cover border border-slate-200"
                              sizes="36px"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {a.namaLengkap.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.namaLengkap}</p>
                          <p className="text-xs text-slate-500">{a.pekerjaan || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-700 font-mono">{a.nik}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-700">{genderLabel[a.jenisKelamin] || a.jenisKelamin}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        {a.noHp && (
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {a.noHp}
                          </span>
                        )}
                        {a.email && (
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {a.email}
                          </span>
                        )}
                        {!a.noHp && !a.email && <span className="text-xs text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {formatDate(a.tanggalGabung)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/anggota/edit/${a.id}`}
                          title="Edit Anggota"
                          aria-label="Edit Anggota"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteAnggotaButton id={a.id} nama={a.namaLengkap} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {anggotaList.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} anggota
              {(q || statusFilter !== "SEMUA") && " (difilter)"}
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
      {/* Tabel Data Anggota */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Tabel Data Anggota
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalFiltered)} dari {totalFiltered} anggota
                {(q || statusFilter !== "SEMUA") && " (difilter)"}
              </p>
            </div>
          </div>
        </div>

        {anggotaList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Users className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Anggota</p>
            <p className="text-sm text-slate-500">
              {q || statusFilter !== "SEMUA"
                ? "Tidak ada anggota yang sesuai filter"
                : "Mulai tambahkan anggota baru"}
            </p>
          </div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {anggotaList.map((a) => (
                <div
                  key={a.id}
                  className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Header with Photo & Status */}
                  <div className="flex items-start justify-between mb-4">
                    {a.foto ? (
                      <div className="relative w-14 h-14">
                        <Image
                          src={a.foto}
                          alt={a.namaLengkap}
                          fill
                          className="rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-colors"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0 border-2 border-blue-200">
                        {a.namaLengkap.charAt(0)}
                      </div>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor[a.status]}`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Name & NIK */}
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {a.namaLengkap}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">{a.nik}</p>
                  </div>

                  {/* Info Details */}
                  <div className="space-y-2 mb-4">
                    {/* Gender & Tanggal Lahir */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{genderLabel[a.jenisKelamin] || a.jenisKelamin}</span>
                      {a.tanggalLahir && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{formatDate(a.tanggalLahir)}</span>
                        </>
                      )}
                    </div>

                    {/* Phone */}
                    {a.noHp && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{a.noHp}</span>
                      </div>
                    )}

                    {/* Email */}
                    {a.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{a.email}</span>
                      </div>
                    )}

                    {/* Pekerjaan */}
                    {a.pekerjaan && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{a.pekerjaan}</span>
                      </div>
                    )}

                    {/* Alamat */}
                    {a.alamat && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{a.alamat}</span>
                      </div>
                    )}

                    {/* Tanggal Gabung */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Gabung: {formatDate(a.tanggalGabung)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/dashboard/anggota/edit/${a.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <DeleteAnggotaButton id={a.id} nama={a.namaLengkap} />
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

      {/* Konfigurasi Data Anggota */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Anggota</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data anggota</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Data Tersimpan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Anggota</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Data Per Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{PER_PAGE} Anggota</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Halaman</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPages} Halaman</p>
          </div>
        </div>
      </div>
    </div>
  );
}
