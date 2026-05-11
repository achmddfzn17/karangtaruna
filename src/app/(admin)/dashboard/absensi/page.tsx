import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, Clock, ClipboardCheck, Settings, Users,
  CheckCircle2, XCircle, Percent, Award
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AttendanceToggle } from "@/components/admin/AttendanceToggle";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Absensi Kegiatan",
};

type PesertaWithRelations = Prisma.AnggotaKegiatanGetPayload<{
  include: {
    anggota: { select: { namaLengkap: true; foto: true } };
    sertifikat: true;
  };
}>;

interface PageProps {
  searchParams: Promise<{ kegiatanId?: string }>;
}

export default async function AbsensiPage({ searchParams }: PageProps) {
  // ✅ Auth check
  await requireAdmin();

  const params = await searchParams;
  const kegiatanId = params.kegiatanId;

  // Fetch kegiatan yang sedang berlangsung atau akan datang
  const kegiatan = await prisma.kegiatan.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
    },
    select: {
      id: true,
      nama: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      status: true,
      jenis: true,
      _count: { select: { peserta: true } },
    },
    orderBy: { tanggalMulai: "asc" },
  });

  let selectedKegiatan: Prisma.KegiatanGetPayload<{
    include: {
      peserta: {
        include: {
          anggota: { select: { namaLengkap: true; foto: true } };
          sertifikat: true;
        };
      };
    };
  }> | null = null;
  
  let peserta: PesertaWithRelations[] = [];

  if (kegiatanId) {
    selectedKegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: {
        peserta: {
          include: {
            anggota: { select: { namaLengkap: true, foto: true } },
            sertifikat: true,
          },
          orderBy: { anggota: { namaLengkap: "asc" } },
        },
      },
    });

    if (selectedKegiatan) {
      peserta = selectedKegiatan.peserta;
    }
  }

  const hadirCount = peserta.filter((p) => p.hadir).length;
  const tidakHadirCount = peserta.length - hadirCount;
  const persentaseHadir = peserta.length > 0 ? Math.round((hadirCount / peserta.length) * 100) : 0;
  const sertifikatCount = peserta.filter((p) => p.sertifikat).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Absensi Kegiatan
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola dan pantau kehadiran anggota dalam kegiatan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pilih Kegiatan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Pilih Kegiatan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Pilih kegiatan untuk mengelola absensi</p>
        </div>
        
        {kegiatan.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Calendar className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Kegiatan Aktif</p>
            <p className="text-sm text-slate-500">
              Tambahkan kegiatan terlebih dahulu di menu Kegiatan
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kegiatan.map((k) => (
              <Link
                key={k.id}
                href={`/dashboard/absensi?kegiatanId=${k.id}`}
                className={`p-5 border-2 rounded-2xl transition-all hover:shadow-lg ${
                  kegiatanId === k.id
                    ? "border-blue-500 bg-blue-50/50 shadow-blue-500/10"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    kegiatanId === k.id ? "bg-blue-600" : "bg-blue-100"
                  }`}>
                    <Calendar className={`w-5 h-5 ${
                      kegiatanId === k.id ? "text-white" : "text-blue-600"
                    }`} />
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      k.status === "ONGOING"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {k.status === "ONGOING" ? "Berlangsung" : "Upcoming"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 min-h-[40px]">
                  {k.nama}
                </p>
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(k.tanggalMulai)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{k._count.peserta} peserta terdaftar</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Cards (when kegiatan selected) */}
      {selectedKegiatan && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-500 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{peserta.length}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Total Peserta</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-green-500 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Hadir</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{hadirCount}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Sudah Hadir</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-red-500 rounded-xl">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Absen</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{tidakHadirCount}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Tidak Hadir</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-cyan-500 rounded-xl">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Rate</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{persentaseHadir}%</p>
              <p className="text-xs text-slate-600 font-medium mt-1">Tingkat Kehadiran</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Daftar Absensi - {selectedKegiatan.nama}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {peserta.length} peserta terdaftar • {sertifikatCount} sertifikat diterbitkan
                </p>
              </div>
            </div>

            {peserta.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
                  <Clock className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Peserta</p>
                <p className="text-sm text-slate-500">
                  Peserta akan muncul saat mereka mendaftar ke kegiatan ini
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-6">Nama Anggota</th>
                      <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Status Kehadiran</th>
                      <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Sertifikat</th>
                      <th className="text-right text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-6">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peserta.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.anggota.foto ? (
                              <div className="relative w-10 h-10 shrink-0">
                                <Image
                                  src={p.anggota.foto}
                                  alt={p.anggota.namaLengkap}
                                  fill
                                  className="rounded-full object-cover border-2 border-slate-200"
                                  sizes="40px"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 border-blue-200">
                                {p.anggota.namaLengkap.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-bold text-slate-900">{p.anggota.namaLengkap}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                              p.hadir
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.hadir ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hadir
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Tidak Hadir
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {p.sertifikat ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                              <Award className="w-3.5 h-3.5" />
                              {p.sertifikat.nomorSertifikat}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">Belum ada</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <AttendanceToggle
                            anggotaKegiatanId={p.id}
                            kegiatanId={selectedKegiatan!.id}
                            currentStatus={p.hadir}
                            namaAnggota={p.anggota.namaLengkap}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Konfigurasi Absensi */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600 rounded-xl">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Absensi</h2>
                <p className="text-xs text-slate-600 mt-0.5">Informasi ringkasan kehadiran kegiatan</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-700">Kegiatan Aktif</p>
                </div>
                <p className="text-lg font-extrabold text-slate-900 line-clamp-1">{selectedKegiatan.nama}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-700">Peserta Terdaftar</p>
                </div>
                <p className="text-lg font-extrabold text-slate-900">{peserta.length} Anggota</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-700">Sertifikat Diterbitkan</p>
                </div>
                <p className="text-lg font-extrabold text-slate-900">{sertifikatCount} Sertifikat</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State when no kegiatan selected */}
      {!selectedKegiatan && kegiatan.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
          <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
            <Calendar className="w-12 h-12 text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-900 mb-1">Pilih Kegiatan</p>
          <p className="text-sm text-slate-500">
            Pilih salah satu kegiatan di atas untuk mulai mengelola absensi
          </p>
        </div>
      )}
    </div>
  );
}
