import { requireMemberAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar, CheckCircle2, Star,
  Users, Check, ClipboardCheck, CreditCard, AlertCircle,
} from "lucide-react";
// Use relative import to avoid @/ alias resolution issue with stale TS server
import KartuAnggotaModal from "../../../components/member/KartuAnggotaModal";

export const metadata = {
  title: "Dashboard Anggota",
};

export default async function MemberDashboard() {
  // ✅ AUTH CHECK: Require member authentication
  // Will redirect to /anggota/login if not authenticated
  const session = await requireMemberAuth();
  const userId = session.user.id;

  const anggotaData = await prisma.anggota.findUnique({
    where: { userId },
    include: {
      kegiatan: { include: { kegiatan: true } },
      iuran: { orderBy: [{ tahun: "desc" }, { bulan: "desc" }], take: 1 },
    },
  });

  const totalAnggota = await prisma.anggota.count({ where: { status: "AKTIF" } });

  const upcomingKegiatan = await prisma.kegiatan.findMany({
    where: { status: "UPCOMING" },
    orderBy: { tanggalMulai: "asc" },
    take: 2,
  });

  const latestBerita = await prisma.berita.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  const isProfileLengkap =
    anggotaData?.nik && anggotaData?.noHp && anggotaData?.alamat && anggotaData?.tanggalLahir;
  const totalKegiatan = anggotaData?.kegiatan.length || 0;
  const kegiatanHadir = anggotaData?.kegiatan.filter((k) => k.hadir).length || 0;
  const tingkatKehadiran =
    totalKegiatan > 0 ? Math.round((kegiatanHadir / totalKegiatan) * 100) : 0;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const iuranBulanIni = anggotaData?.iuran.find(
    (i) => i.bulan === currentMonth && i.tahun === currentYear
  );

  return (
    <div className="space-y-6">
      {/* Profile incomplete warning */}
      {!isProfileLengkap && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Profil Anda belum lengkap. </span>
          <Link href="/member/profile" className="underline font-bold hover:text-amber-900">
            Lengkapi sekarang →
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-2xl p-8 shadow-sm shadow-blue-600/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 relative z-10">
          Selamat Datang, {session.user.name}! 👋
        </h2>
        <p className="text-blue-100 relative z-10">
          Terima kasih telah menjadi bagian dari Karang Taruna Generasi Emas
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Kegiatan Diikuti</p>
            <p className="text-xl font-extrabold text-blue-600">{totalKegiatan}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Total partisipasi</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Tingkat Kehadiran</p>
            <p className={`text-xl font-extrabold ${tingkatKehadiran >= 80 ? "text-green-500" : tingkatKehadiran >= 50 ? "text-orange-500" : "text-red-500"}`}>
              {tingkatKehadiran}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{kegiatanHadir} dari {totalKegiatan} hadir</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tingkatKehadiran >= 80 ? "bg-green-100" : tingkatKehadiran >= 50 ? "bg-orange-100" : "bg-red-100"}`}>
            <CheckCircle2 className={`w-5 h-5 ${tingkatKehadiran >= 80 ? "text-green-500" : tingkatKehadiran >= 50 ? "text-orange-500" : "text-red-500"}`} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Status</p>
            <p className={`text-xl font-extrabold ${anggotaData?.status === "AKTIF" ? "text-green-500" : "text-slate-500"}`}>
              {anggotaData?.status === "AKTIF" ? "Aktif" : "Non Aktif"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-green-500 fill-green-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Total Anggota</p>
            <p className="text-xl font-extrabold text-purple-600">{totalAnggota}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Anggota aktif</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Achievement & Badges */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">🏆 Achievement & Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border ${anggotaData?.status === "AKTIF" ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"} flex flex-col items-center justify-center text-center`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${anggotaData?.status === "AKTIF" ? "bg-green-500" : "bg-slate-300"}`}>
              <Check className="w-5 h-5 text-white" />
            </div>
            <h4 className={`font-bold text-sm ${anggotaData?.status === "AKTIF" ? "text-green-700" : "text-slate-500"}`}>Member Aktif</h4>
            <p className={`text-[11px] ${anggotaData?.status === "AKTIF" ? "text-green-600" : "text-slate-400"}`}>Status keanggotaan aktif</p>
          </div>

          <div className={`p-5 rounded-2xl border ${isProfileLengkap ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"} flex flex-col items-center justify-center text-center`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${isProfileLengkap ? "bg-purple-500" : "bg-slate-300"}`}>
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <h4 className={`font-bold text-sm ${isProfileLengkap ? "text-purple-700" : "text-slate-500"}`}>Profile Lengkap</h4>
            <p className={`text-[11px] ${isProfileLengkap ? "text-purple-600" : "text-slate-400"}`}>
              {isProfileLengkap ? "Semua data profile terisi" : "Profil belum lengkap"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Profile</h3>
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">NIK</p>
              <p className="text-sm font-semibold text-slate-900">{anggotaData?.nik || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{anggotaData?.email || session.user.email || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">No. HP</p>
              <p className="text-sm font-semibold text-slate-900">{anggotaData?.noHp || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Bergabung Sejak</p>
              <p className="text-sm font-semibold text-slate-900">
                {anggotaData?.tanggalGabung
                  ? anggotaData.tanggalGabung.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="flex-1 flex flex-col gap-3">
            <KartuAnggotaModal
              namaLengkap={anggotaData?.namaLengkap || session.user.name || ""}
              nik={anggotaData?.nik || ""}
              status={anggotaData?.status || "AKTIF"}
              tanggalGabung={anggotaData?.tanggalGabung?.toISOString() || ""}
              foto={anggotaData?.foto || null}
            />

            <Link
              href="/member/iuran"
              className={`w-full border rounded-xl p-4 flex items-center gap-4 transition-colors text-left ${
                iuranBulanIni
                  ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
                  : "bg-orange-50 hover:bg-orange-100 border-orange-100"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iuranBulanIni ? "bg-emerald-200" : "bg-orange-200"}`}>
                <CreditCard className={`w-5 h-5 ${iuranBulanIni ? "text-emerald-700" : "text-orange-700"}`} />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${iuranBulanIni ? "text-emerald-900" : "text-orange-900"}`}>
                  Iuran Bulan Ini
                </h4>
                <p className={`text-[11px] ${iuranBulanIni ? "text-emerald-700" : "text-orange-700"}`}>
                  {iuranBulanIni ? "✓ Sudah Lunas" : "Belum Dibayar — Klik untuk bayar"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Update Terkini */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Update Terkini</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Kegiatan Terdekat
            </h4>
            {upcomingKegiatan.length > 0 ? (
              <div className="space-y-4">
                {upcomingKegiatan.map((kegiatan) => (
                  <Link
                    key={kegiatan.id}
                    href="/member/kegiatan"
                    className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50 hover:bg-orange-50 hover:border-orange-100 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-orange-600 uppercase">
                        {new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                      <span className="text-lg font-extrabold text-orange-600 leading-none">
                        {new Date(kegiatan.tanggalMulai).getDate()}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{kegiatan.nama}</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{kegiatan.lokasi || "Lokasi belum ditentukan"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[13px] text-slate-500 font-medium">Belum ada kegiatan terdekat.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
              Pengumuman & Berita
            </h4>
            {latestBerita.length > 0 ? (
              <div className="space-y-4">
                {latestBerita.map((berita) => (
                  <Link
                    key={berita.id}
                    href={`/member/berita/${berita.slug}`}
                    className="block p-4 rounded-xl border border-slate-50 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                  >
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">{berita.judul}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{berita.ringkasan || "Baca selengkapnya..."}</p>
                    <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {berita.publishedAt
                        ? new Date(berita.publishedAt).toLocaleDateString("id-ID", { dateStyle: "long" })
                        : "-"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[13px] text-slate-500 font-medium">Belum ada pengumuman terbaru.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
