import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Activity,
} from "lucide-react";

export const metadata = {
  title: "Riwayat Kegiatan",
};

const jenisColor: Record<string, string> = {
  SOSIAL:       "bg-blue-100 text-blue-700",
  PENDIDIKAN:   "bg-purple-100 text-purple-700",
  EKONOMI:      "bg-yellow-100 text-yellow-700",
  OLAHRAGA:     "bg-green-100 text-green-700",
  SENI_BUDAYA:  "bg-pink-100 text-pink-700",
  LAINNYA:      "bg-slate-100 text-slate-700",
};

const statusColor: Record<string, string> = {
  UPCOMING:   "bg-sky-100 text-sky-700",
  ONGOING:    "bg-orange-100 text-orange-700",
  SELESAI:    "bg-green-100 text-green-700",
  DIBATALKAN: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  UPCOMING:   "Akan Datang",
  ONGOING:    "Berlangsung",
  SELESAI:    "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export default async function RiwayatKegiatanPage() {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  const userId = (session.user as any).id;

  const anggota = await prisma.anggota.findUnique({
    where: { userId },
    include: {
      kegiatan: {
        include: {
          kegiatan: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const allKegiatan = anggota?.kegiatan ?? [];
  const totalTerdaftar = allKegiatan.length;
  const totalHadir = allKegiatan.filter((k) => k.hadir).length;
  const totalTidakHadir = totalTerdaftar - totalHadir;
  const persentaseHadir =
    totalTerdaftar > 0 ? Math.round((totalHadir / totalTerdaftar) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Riwayat Kegiatan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Rekam jejak partisipasi Anda dalam setiap kegiatan Karang Taruna
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Terdaftar</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalTerdaftar}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Hadir</p>
            <p className="text-2xl font-extrabold text-green-600">{totalHadir}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase">Tidak Hadir</p>
            <p className="text-2xl font-extrabold text-red-500">{totalTidakHadir}</p>
          </div>
        </div>

        {/* Kehadiran Rate Card */}
        <div className="bg-blue-600 p-5 rounded-2xl shadow-sm shadow-blue-600/20 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-blue-100 font-semibold uppercase">Kehadiran</p>
            <p className="text-2xl font-extrabold text-white">{persentaseHadir}%</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTerdaftar > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-800">Tingkat Partisipasi</span>
            </div>
            <span className="text-sm font-extrabold text-blue-600">{persentaseHadir}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${persentaseHadir}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-slate-400 font-medium">0%</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {persentaseHadir >= 80
                ? "🏆 Luar biasa! Kehadiran sangat baik"
                : persentaseHadir >= 50
                ? "👍 Pertahankan partisipasi Anda"
                : "💪 Ayo tingkatkan kehadiran Anda"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">100%</span>
          </div>
        </div>
      )}

      {/* Kegiatan List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            Semua Kegiatan ({totalTerdaftar})
          </h2>
        </div>

        {allKegiatan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">
              Belum Ada Riwayat Kegiatan
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Anda belum terdaftar di kegiatan manapun. Ikuti kegiatan Karang Taruna untuk
              membangun rekam jejak partisipasi Anda!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {allKegiatan.map((ak) => {
              const kg = ak.kegiatan;
              const isSelesai = kg.status === "SELESAI";
              return (
                <div
                  key={ak.id}
                  className="px-6 py-5 flex items-start gap-5 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Date Block */}
                  <div className="w-14 shrink-0 text-center">
                    <div className="bg-slate-100 rounded-xl py-2 px-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                        {new Date(kg.tanggalMulai).toLocaleDateString("id-ID", { month: "short" })}
                      </p>
                      <p className="text-xl font-extrabold text-slate-900 leading-tight">
                        {new Date(kg.tanggalMulai).getDate()}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        {new Date(kg.tanggalMulai).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {kg.nama}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${jenisColor[kg.jenis] || jenisColor.LAINNYA}`}>
                        {kg.jenis.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusColor[kg.status] || ""}`}>
                        {statusLabel[kg.status] || kg.status}
                      </span>
                    </div>

                    {kg.deskripsi && (
                      <p className="text-[12px] text-slate-500 line-clamp-1 mb-2">
                        {kg.deskripsi}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                      {kg.lokasi && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {kg.lokasi}
                        </span>
                      )}
                      {kg.tanggalSelesai && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          s/d {new Date(kg.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Badge */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    {isSelesai ? (
                      ak.hadir ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-[10px] font-bold text-green-600">Hadir</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                          <span className="text-[10px] font-bold text-red-500">Absen</span>
                        </>
                      )
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-sky-600" />
                        </div>
                        <span className="text-[10px] font-bold text-sky-600">Terdaftar</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
