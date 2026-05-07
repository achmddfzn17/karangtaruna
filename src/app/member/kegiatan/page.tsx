import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Calendar, MapPin, CheckCircle2, XCircle, Clock,
  TrendingUp, Award, Activity, Plus,
} from "lucide-react";
import DaftarKegiatanButton from "@/components/member/DaftarKegiatanButton";

export const metadata = { title: "Kegiatan" };

const jenisColor: Record<string, string> = {
  SOSIAL: "bg-blue-100 text-blue-700",
  PENDIDIKAN: "bg-purple-100 text-purple-700",
  EKONOMI: "bg-yellow-100 text-yellow-700",
  OLAHRAGA: "bg-green-100 text-green-700",
  SENI_BUDAYA: "bg-pink-100 text-pink-700",
  LAINNYA: "bg-slate-100 text-slate-700",
};

const statusColor: Record<string, string> = {
  UPCOMING: "bg-sky-100 text-sky-700",
  ONGOING: "bg-orange-100 text-orange-700",
  SELESAI: "bg-green-100 text-green-700",
  DIBATALKAN: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  UPCOMING: "Akan Datang",
  ONGOING: "Berlangsung",
  SELESAI: "Selesai",
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
        include: { kegiatan: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Kegiatan yang bisa didaftar (UPCOMING/ONGOING) dan belum terdaftar
  const terdaftarIds = anggota?.kegiatan.map((k) => k.kegiatanId) ?? [];
  const kegiatanTersedia = await prisma.kegiatan.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      id: { notIn: terdaftarIds },
    },
    orderBy: { tanggalMulai: "asc" },
    take: 10,
  });

  const allKegiatan = anggota?.kegiatan ?? [];
  const totalTerdaftar = allKegiatan.length;
  const totalHadir = allKegiatan.filter((k) => k.hadir).length;
  const totalTidakHadir = allKegiatan.filter(
    (k) => k.kegiatan.status === "SELESAI" && !k.hadir
  ).length;
  const persentaseHadir =
    totalTerdaftar > 0 ? Math.round((totalHadir / totalTerdaftar) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Kegiatan</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar kegiatan dan rekam jejak partisipasi Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Terdaftar", value: totalTerdaftar, icon: Activity, color: "bg-blue-100 text-blue-600" },
          { label: "Hadir", value: totalHadir, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
          { label: "Tidak Hadir", value: totalTidakHadir, icon: XCircle, color: "bg-red-100 text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase">{s.label}</p>
              <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
        <div className="bg-blue-600 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-blue-100 font-semibold uppercase">Kehadiran</p>
            <p className="text-2xl font-extrabold text-white">{persentaseHadir}%</p>
          </div>
        </div>
      </div>

      {/* Kegiatan Tersedia untuk Didaftar */}
      {kegiatanTersedia.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/50 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-blue-800">
              Kegiatan Tersedia ({kegiatanTersedia.length})
            </h2>
            <span className="text-[11px] text-blue-500 font-medium">— Klik Daftar untuk bergabung</span>
          </div>
          <div className="divide-y divide-slate-50">
            {kegiatanTersedia.map((k) => (
              <div key={k.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-slate-800">{k.nama}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${jenisColor[k.jenis] || jenisColor.LAINNYA}`}>
                      {k.jenis.replace("_", " ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor[k.status]}`}>
                      {statusLabel[k.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(k.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {k.lokasi && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {k.lokasi}
                      </span>
                    )}
                  </div>
                </div>
                <DaftarKegiatanButton kegiatanId={k.id} terdaftar={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat Kegiatan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Riwayat Kegiatan Saya ({totalTerdaftar})</h2>
        </div>

        {allKegiatan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Belum Ada Riwayat Kegiatan</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Daftar ke kegiatan di atas untuk mulai berpartisipasi.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {allKegiatan.map((ak) => {
              const kg = ak.kegiatan;
              const isSelesai = kg.status === "SELESAI";
              const bisaBatal = kg.status === "UPCOMING";
              return (
                <div key={ak.id} className="px-6 py-5 flex items-start gap-5 hover:bg-slate-50/60 transition-colors">
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
                      <h3 className="text-sm font-bold text-slate-900 truncate">{kg.nama}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${jenisColor[kg.jenis] || jenisColor.LAINNYA}`}>
                        {kg.jenis.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusColor[kg.status] || ""}`}>
                        {statusLabel[kg.status] || kg.status}
                      </span>
                    </div>
                    {kg.deskripsi && (
                      <p className="text-[12px] text-slate-500 line-clamp-1 mb-2">{kg.deskripsi}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                      {kg.lokasi && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{kg.lokasi}</span>
                      )}
                      {kg.tanggalSelesai && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          s/d {new Date(kg.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + Batal */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
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
                    {bisaBatal && (
                      <DaftarKegiatanButton kegiatanId={kg.id} terdaftar={true} />
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
