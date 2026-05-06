import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Calendar, CheckCircle2, User as UserIcon, Star, 
  Cake, Users, Check, ClipboardCheck, QrCode, CreditCard 
} from "lucide-react";

export const metadata = {
  title: "Dashboard Anggota",
};

export default async function MemberDashboard() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/anggota/login");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") {
    redirect("/anggota/login");
  }

  const userId = (session.user as any).id;
  
  // Get Anggota data
  const anggotaData = await prisma.anggota.findUnique({
    where: { userId: userId },
    include: {
      kegiatan: {
        include: {
          kegiatan: true,
        },
      },
    },
  });

  const totalAnggota = await prisma.anggota.count({
    where: { status: "AKTIF" }
  });

  // Fetch New Update Feature Data (Upcoming Events & Latest News)
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

  // Calculations
  const calculateAge = (dob: Date | null | undefined) => {
    if (!dob) return "N/A";
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const calculateMonthsJoined = (joinDate: Date) => {
    const now = new Date();
    const months = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
    return months === 0 ? 1 : months;
  };

  const umur = calculateAge(anggotaData?.tanggalLahir);
  const bulanBergabung = anggotaData ? calculateMonthsJoined(anggotaData.tanggalGabung) : 0;
  const isProfileLengkap = anggotaData?.nik && anggotaData?.noHp && anggotaData?.alamat && anggotaData?.tanggalLahir;
  const kegiatanDiikuti = anggotaData?.kegiatan.length || 0;

  return (
    <div className="space-y-6">
      
      {/* Alert Bar */}
      <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
        Selamat datang!
      </div>

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
        {/* Status */}
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

        {/* Umur */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Umur</p>
            <p className="text-xl font-extrabold text-blue-500">{umur === "N/A" ? "N/A" : `${umur} Th`}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Cake className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Bergabung */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Bergabung</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-extrabold text-purple-600">{bulanBergabung} Bulan</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {anggotaData?.tanggalGabung ? anggotaData.tanggalGabung.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        {/* Total Anggota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Total Anggota</p>
            <p className="text-xl font-extrabold text-orange-500">{totalAnggota}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Achievement & Badges */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          🏆 Achievement & Badges
        </h3>
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
            <p className={`text-[11px] ${isProfileLengkap ? "text-purple-600" : "text-slate-400"}`}>Semua data profile terisi</p>
          </div>
        </div>
      </div>

      {/* Profile & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Profile</h3>
          <div className="grid grid-cols-2 gap-y-6">
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">NIK</p>
              <p className="text-sm font-semibold text-slate-900">{anggotaData?.nik || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-900">{anggotaData?.email || session.user.email || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">No. HP</p>
              <p className="text-sm font-semibold text-slate-900">{anggotaData?.noHp || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Bergabung Sejak</p>
              <p className="text-sm font-semibold text-slate-900">
                {anggotaData?.tanggalGabung ? anggotaData.tanggalGabung.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="flex-1 flex flex-col gap-3">
            <button className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl p-4 flex items-center gap-4 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-900">Kartu Anggota Digital</h4>
                <p className="text-[11px] text-purple-700">QR Code & Info</p>
              </div>
            </button>
            <button className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl p-4 flex items-center gap-4 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Bayar Iuran Kas</h4>
                <p className="text-[11px] text-emerald-700">Bulan ini: Belum Lunas</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Fitur Update: Informasi & Kegiatan Terkini */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Update Terkini</h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">BARU</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kegiatan Terdekat */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Kegiatan Terdekat
            </h4>
            
            {upcomingKegiatan.length > 0 ? (
              <div className="space-y-4">
                {upcomingKegiatan.map((kegiatan) => (
                  <div key={kegiatan.id} className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50 hover:bg-orange-50 hover:border-orange-100 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-orange-600 uppercase">{new Date(kegiatan.tanggalMulai).toLocaleDateString('id-ID', { month: 'short' })}</span>
                      <span className="text-lg font-extrabold text-orange-600 leading-none">{new Date(kegiatan.tanggalMulai).getDate()}</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{kegiatan.nama}</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{kegiatan.lokasi || "Lokasi belum ditentukan"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[13px] text-slate-500 font-medium">Belum ada kegiatan terdekat.</p>
              </div>
            )}
          </div>

          {/* Pengumuman / Berita Terbaru */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
              Pengumuman & Berita
            </h4>
            
            {latestBerita.length > 0 ? (
              <div className="space-y-4">
                {latestBerita.map((berita) => (
                  <div key={berita.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer">
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">{berita.judul}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{berita.ringkasan || "Baca selengkapnya..."}</p>
                    <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {berita.publishedAt ? new Date(berita.publishedAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "-"}
                    </div>
                  </div>
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
