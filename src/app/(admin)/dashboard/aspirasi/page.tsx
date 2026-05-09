import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  User,
  Reply,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";

export const metadata = {
  title: "Kelola Aspirasi",
};

export default async function AdminAspirasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; deleted?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const params = await searchParams;

  // Fetch all aspirations
  const allAspirasi = await prisma.aspirasi.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Server Action: Reply to Aspirasi
  async function replyAspirasi(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const balasan = formData.get("balasan") as string;
    const status = formData.get("status") as string | null;

    // Input validation
    if (!id || typeof id !== "string" || !id.match(/^[a-z0-9]+$/i)) {
      throw new Error("ID aspirasi tidak valid");
    }
    
    if (!balasan || typeof balasan !== "string" || balasan.trim().length < 5) {
      throw new Error("Balasan minimal 5 karakter");
    }
    
    if (balasan.length > 2000) {
      throw new Error("Balasan maksimal 2000 karakter");
    }
    
    const validStatuses = ["DIPROSES", "SELESAI", "DITOLAK"];
    if (status && !validStatuses.includes(status)) {
      throw new Error("Status tidak valid");
    }

    try {
      // Verify aspirasi exists
      const aspirasi = await prisma.aspirasi.findUnique({ where: { id } });
      if (!aspirasi) {
        throw new Error("Aspirasi tidak ditemukan");
      }

      await prisma.aspirasi.update({
        where: { id },
        data: {
          balasan: balasan.trim(),
          status: (status || "SELESAI") as any,
        },
      });
      revalidatePath("/dashboard/aspirasi");
      revalidatePath("/member/aspirasi");
    } catch (e) {
      console.error(e);
      throw new Error("Gagal mengirim balasan");
    }

    redirect("/dashboard/aspirasi?success=1");
  }

  // Server Action: Delete Aspirasi
  async function deleteAspirasi(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;

    try {
      await prisma.aspirasi.delete({ where: { id } });
      revalidatePath("/dashboard/aspirasi");
    } catch (e) {
      console.error(e);
      throw new Error("Gagal menghapus aspirasi");
    }

    redirect("/dashboard/aspirasi?deleted=1");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Aspirasi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dengar ide dan masukan dari para anggota
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aspirasi..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(params.success || params.deleted || params.error) && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          params.success ? "bg-green-50 border-green-200 text-green-700" :
          params.deleted ? "bg-amber-50 border-amber-200 text-amber-700" :
          "bg-red-50 border-red-200 text-red-700"
        }`}>
          {params.success && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {params.deleted && <Trash2 className="w-5 h-5 shrink-0" />}
          {params.error && <AlertCircle className="w-5 h-5 shrink-0" />}
          {params.success ? "Balasan berhasil dikirim." :
           params.deleted ? "Aspirasi telah dihapus." :
           "Terjadi kesalahan teknis."}
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {allAspirasi.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada aspirasi masuk.</p>
          </div>
        ) : (
          allAspirasi.map((asp) => (
            <div key={asp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Main Content */}
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{asp.user?.name || asp.nama || "Anonim"}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{new Date(asp.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor[asp.status]}`}>
                    {statusLabel[asp.status]}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">{asp.kategori}</h3>
                  <h2 className="text-lg font-extrabold text-slate-900 mb-2">{asp.judul}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{asp.pesan}</p>
                </div>

                {asp.balasan && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px] font-extrabold text-blue-600 uppercase">Balasan Terkirim</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{asp.balasan}"</p>
                  </div>
                )}
              </div>

              {/* Action Sidebar */}
              <div className="w-full md:w-80 p-6 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Aksi Cepat</h3>
                
                <form action={replyAspirasi} className="space-y-4">
                  <input type="hidden" name="id" value={asp.id} />
                  <div className="space-y-1.5">
                    <label htmlFor={`balasan-${asp.id}`} className="text-[11px] font-bold text-slate-600">Berikan Balasan</label>
                    <textarea
                      id={`balasan-${asp.id}`}
                      name="balasan"
                      rows={3}
                      required
                      placeholder="Tulis balasan Anda..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`status-${asp.id}`} className="text-[11px] font-bold text-slate-600">Update Status</label>
                    <select
                      id={`status-${asp.id}`}
                      name="status"
                      title="Update Status Aspirasi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="DIPROSES">Diproses</option>
                      <option value="SELESAI">Selesai / Terjawab</option>
                      <option value="DITOLAK">Ditolak</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                  >
                    <Reply className="w-4 h-4" />
                    Kirim Balasan
                  </button>
                </form>

                <DeleteConfirmButton
                  action={deleteAspirasi}
                  itemId={asp.id}
                  message="Hapus aspirasi ini?"
                  formChildren={<input type="hidden" name="id" value={asp.id} />}
                  className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
