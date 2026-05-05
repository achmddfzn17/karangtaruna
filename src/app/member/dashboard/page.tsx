import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Calendar, CheckCircle2, User as UserIcon } from "lucide-react";

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

  const kegiatanDiikuti = anggotaData?.kegiatan.length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header & Logout */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard Anggota</h1>
        <form
          action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut();
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            Logout
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Digital KTA & Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Digital KTA Card */}
          <div className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-600 to-emerald-800 p-6 flex flex-col justify-between border border-white/10 group">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-[10px] font-bold tracking-widest uppercase">Karang Taruna</p>
                <p className="text-white font-heading font-bold text-lg leading-tight">Generasi Emas</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-1">
              {/* Fake EMV Chip */}
              <div className="w-10 h-8 bg-yellow-400/80 rounded-md mb-2 overflow-hidden relative">
                <div className="absolute inset-0 border border-yellow-600/30" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-yellow-600/30" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-yellow-600/30" />
              </div>

              <p className="text-white text-xl font-bold tracking-widest font-mono drop-shadow-md">
                {anggotaData?.nik ? `${anggotaData.nik.slice(0,4)} **** **** ${anggotaData.nik.slice(-4)}` : "Belum diatur"}
              </p>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-white/60 text-[10px] uppercase font-semibold">Nama Anggota</p>
                  <p className="text-white font-bold text-sm truncate max-w-[150px]">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] uppercase font-semibold text-right">Status</p>
                  <p className="text-green-300 font-bold text-sm text-right">{anggotaData?.status === "AKTIF" ? "AKTIF" : "NON-AKTIF"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Kegiatan Diikuti</p>
              <h3 className="text-xl font-bold text-foreground">{kegiatanDiikuti}</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Persentase Hadir</p>
              <h3 className="text-xl font-bold text-foreground">85%</h3>
            </div>
          </div>

        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Iuran Kas & QR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Status Iuran */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold font-heading mb-1">Status Iuran Kas</h2>
                <p className="text-sm text-muted-foreground mb-4">Bulan Mei 2026</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-600">LUNAS</h3>
                  <p className="text-sm text-muted-foreground">Terima kasih atas partisipasinya!</p>
                </div>
              </div>
            </div>

            {/* QR Scanner CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
              <div>
                <h2 className="text-lg font-bold font-heading mb-1 relative z-10">Scan Kehadiran</h2>
                <p className="text-sm text-slate-400 mb-4 relative z-10">Gunakan fitur ini saat berada di lokasi kegiatan.</p>
              </div>
              <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors relative z-10">
                Buka Kamera Scanner
              </button>
            </div>

          </div>

          {/* Timeline Kegiatan */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading">Aktivitas Saya</h2>
              <button className="text-sm font-semibold text-green-600 hover:text-green-700">Lihat Semua</button>
            </div>
            
            {anggotaData?.kegiatan && anggotaData.kegiatan.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {anggotaData.kegiatan.map((ak, idx) => (
                  <div key={ak.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-white shadow-sm hover:border-green-300 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground text-sm">{ak.kegiatan.nama}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ak.hadir ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {ak.hadir ? 'Hadir' : 'Terdaftar'}
                        </span>
                      </div>
                      <time className="text-xs text-muted-foreground font-medium">
                        {new Date(ak.kegiatan.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-2xl border border-dashed border-border/60">
                <Calendar className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">Anda belum mengikuti kegiatan apapun.</p>
                <button className="mt-3 px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">Cari Kegiatan</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
