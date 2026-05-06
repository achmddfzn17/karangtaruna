import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Papan Aspirasi",
};

export default async function AspirasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");

  const userId = (session.user as any).id;
  const params = await searchParams;

  // Fetch member's own aspirations
  const myAspirasi = await prisma.aspirasi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Server Action: Submit Aspirasi
  async function submitAspirasi(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) redirect("/anggota/login");
    const userId = (session.user as any).id;

    const judul = formData.get("judul") as string;
    const kategori = formData.get("kategori") as string;
    const pesan = formData.get("pesan") as string;

    if (!judul || !pesan) return;

    try {
      await prisma.aspirasi.create({
        data: {
          userId,
          judul,
          kategori,
          pesan,
        },
      });
      revalidatePath("/member/aspirasi");
      redirect("/member/aspirasi?success=1");
    } catch (e) {
      console.error(e);
      redirect("/member/aspirasi?error=1");
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    DIPROSES: "bg-blue-100 text-blue-700",
    SELESAI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    PENDING: "Menunggu",
    DIPROSES: "Diproses",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Papan Aspirasi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sampaikan ide, saran, atau keluhan Anda untuk kemajuan Karang Taruna
        </p>
      </div>

      {/* Alerts */}
      {params.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Aspirasi Anda berhasil dikirim! Admin akan segera meninjau.
        </div>
      )}
      {params.error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Gagal mengirim aspirasi. Silakan coba lagi nanti.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Submit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Kirim Aspirasi Baru
            </h2>
            <form action={submitAspirasi} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="judul" className="text-[12px] font-bold text-slate-600">
                  Judul Aspirasi
                </label>
                <input
                  id="judul"
                  name="judul"
                  type="text"
                  required
                  placeholder="Contoh: Usul Program Kerja"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="kategori" className="text-[12px] font-bold text-slate-600">
                  Kategori
                </label>
                <select
                  id="kategori"
                  name="kategori"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="Saran">Saran</option>
                  <option value="Keluhan">Keluhan</option>
                  <option value="Ide Program">Ide Program</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pesan" className="text-[12px] font-bold text-slate-600">
                  Pesan Aspirasi
                </label>
                <textarea
                  id="pesan"
                  name="pesan"
                  rows={5}
                  required
                  placeholder="Ceritakan detail aspirasi Anda..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
                Kirim Sekarang
              </button>
            </form>
          </div>
        </div>

        {/* Right: Aspirasi List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-500" />
            Aspirasi Saya ({myAspirasi.length})
          </h2>

          {myAspirasi.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Anda belum pernah mengirim aspirasi.</p>
            </div>
          ) : (
            myAspirasi.map((asp) => (
              <div key={asp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor[asp.status]}`}>
                          {statusLabel[asp.status]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {asp.kategori}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{asp.judul}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400 font-medium">
                        {new Date(asp.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-50 mb-4 whitespace-pre-wrap">
                    {asp.pesan}
                  </p>

                  {asp.balasan && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-blue-600 uppercase mb-1">Balasan Admin</p>
                          <p className="text-sm text-slate-700 italic">"{asp.balasan}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
