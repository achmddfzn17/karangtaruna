import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  User,
  Reply,
  Trash2,
  Settings,
  Clock,
  XCircle,
  Inbox,
} from "lucide-react";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { StatusAspirasi, Prisma } from "@prisma/client";

export const metadata = {
  title: "Kelola Aspirasi",
};

const VALID_STATUS: StatusAspirasi[] = ["PENDING", "DIPROSES", "SELESAI", "DITOLAK"];

interface PageProps {
  searchParams: Promise<{ 
    success?: string; 
    error?: string; 
    deleted?: string;
    status?: string;
  }>;
}

export default async function AdminAspirasiPage({ searchParams }: PageProps) {
  // ✅ Auth check with helper
  await requireAdmin();

  const params = await searchParams;
  
  // Status filter
  const statusParam = params.status;
  const statusFilter: StatusAspirasi | "SEMUA" = 
    statusParam && VALID_STATUS.includes(statusParam as StatusAspirasi)
      ? (statusParam as StatusAspirasi)
      : "SEMUA";

  // Build where condition
  const where: Prisma.AspirasiWhereInput = 
    statusFilter !== "SEMUA" ? { status: statusFilter } : {};

  // Parallel queries for stats and data
  const [allAspirasi, totalPending, totalDiproses, totalSelesai, totalDitolak] = await Promise.all([
    prisma.aspirasi.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aspirasi.count({ where: { status: "PENDING" } }),
    prisma.aspirasi.count({ where: { status: "DIPROSES" } }),
    prisma.aspirasi.count({ where: { status: "SELESAI" } }),
    prisma.aspirasi.count({ where: { status: "DITOLAK" } }),
  ]);

  const totalAll = totalPending + totalDiproses + totalSelesai + totalDitolak;

  // Server Action: Reply to Aspirasi
  async function replyAspirasi(formData: FormData) {
    "use server";
    
    // ✅ Auth check in server action
    await requireAdmin();

    const id = formData.get("id") as string;
    const balasan = formData.get("balasan") as string;
    const status = formData.get("status") as string | null;

    // Input validation
    if (!id || typeof id !== "string") {
      throw new Error("ID aspirasi tidak valid");
    }
    
    if (!balasan || typeof balasan !== "string" || balasan.trim().length < 5) {
      throw new Error("Balasan minimal 5 karakter");
    }
    
    if (balasan.length > 2000) {
      throw new Error("Balasan maksimal 2000 karakter");
    }
    
    const validStatuses: StatusAspirasi[] = ["DIPROSES", "SELESAI", "DITOLAK"];
    if (status && !validStatuses.includes(status as StatusAspirasi)) {
      throw new Error("Status tidak valid");
    }

    try {
      const aspirasi = await prisma.aspirasi.findUnique({ where: { id } });
      if (!aspirasi) {
        throw new Error("Aspirasi tidak ditemukan");
      }

      await prisma.aspirasi.update({
        where: { id },
        data: {
          balasan: balasan.trim(),
          status: (status || "SELESAI") as StatusAspirasi,
        },
      });
      revalidatePath("/dashboard/aspirasi");
      revalidatePath("/member/aspirasi");
    } catch (error) {
      console.error("[REPLY_ASPIRASI_ERROR]", error);
      if (error instanceof Error) throw error;
      throw new Error("Gagal mengirim balasan");
    }

    redirect("/dashboard/aspirasi?success=1");
  }

  // Server Action: Delete Aspirasi
  async function deleteAspirasi(formData: FormData) {
    "use server";
    
    // ✅ Auth check in server action
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) throw new Error("ID tidak valid");

    try {
      await prisma.aspirasi.delete({ where: { id } });
      revalidatePath("/dashboard/aspirasi");
    } catch (error) {
      console.error("[DELETE_ASPIRASI_ERROR]", error);
      throw new Error("Gagal menghapus aspirasi");
    }

    redirect("/dashboard/aspirasi?deleted=1");
  }

  const statusColor: Record<StatusAspirasi, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    DIPROSES: "bg-blue-100 text-blue-700",
    SELESAI: "bg-green-100 text-green-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<StatusAspirasi, string> = {
    PENDING: "Menunggu",
    DIPROSES: "Diproses",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak",
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Aspirasi
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola ide dan masukan dari para anggota Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {(params.success || params.deleted || params.error) && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium border ${
            params.success
              ? "bg-green-50 border-green-200 text-green-700"
              : params.deleted
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {params.success && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {params.deleted && <Trash2 className="w-5 h-5 shrink-0" />}
          {params.error && <AlertCircle className="w-5 h-5 shrink-0" />}
          {params.success
            ? "Balasan berhasil dikirim"
            : params.deleted
            ? "Aspirasi telah dihapus"
            : "Terjadi kesalahan"}
        </div>
      )}

      {/* Tombol Pengelolaan - Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Filter Aspirasi
          </h2>
          <p className="text-xs text-slate-500 mt-1">Filter berdasarkan status aspirasi</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/aspirasi?status=SEMUA"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                statusFilter === "SEMUA" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({totalAll})
            </a>
            <a
              href="/dashboard/aspirasi?status=PENDING"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                statusFilter === "PENDING" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Menunggu ({totalPending})
            </a>
            <a
              href="/dashboard/aspirasi?status=DIPROSES"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                statusFilter === "DIPROSES" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Diproses ({totalDiproses})
            </a>
            <a
              href="/dashboard/aspirasi?status=SELESAI"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                statusFilter === "SELESAI" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Selesai ({totalSelesai})
            </a>
            <a
              href="/dashboard/aspirasi?status=DITOLAK"
              className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                statusFilter === "DITOLAK" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Ditolak ({totalDitolak})
            </a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPending}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Menunggu Respon</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Reply className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Proses</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalDiproses}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Sedang Diproses</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Selesai</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalSelesai}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Telah Ditanggapi</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Tolak</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalDitolak}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Ditolak</p>
        </div>
      </div>

      {/* Aspirasi List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Daftar Aspirasi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {allAspirasi.length} aspirasi
              {statusFilter !== "SEMUA" && " (difilter)"}
            </p>
          </div>
        </div>

        {allAspirasi.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Inbox className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Aspirasi</p>
            <p className="text-sm text-slate-500">
              {statusFilter !== "SEMUA"
                ? "Tidak ada aspirasi dengan status ini"
                : "Aspirasi dari anggota akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {allAspirasi.map((asp) => (
              <div key={asp.id} className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-lg">
                {/* Main Content */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        {asp.user?.name || asp.nama || "Anonim"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(asp.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor[asp.status]}`}>
                      {statusLabel[asp.status]}
                    </span>
                  </div>

                  <div className="mb-4">
                    {asp.kategori && (
                      <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                        {asp.kategori}
                      </h3>
                    )}
                    <h2 className="text-base font-extrabold text-slate-900 mb-2">{asp.judul}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {asp.pesan}
                    </p>
                  </div>

                  {asp.balasan && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-extrabold text-blue-600 uppercase">
                          Balasan Admin
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 italic">
                        &ldquo;{asp.balasan}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Sidebar */}
                <div className="w-full md:w-80 p-6 bg-slate-50/30">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Aksi Cepat
                  </h3>

                  <form action={replyAspirasi} className="space-y-3">
                    <input type="hidden" name="id" value={asp.id} />
                    <div className="space-y-1.5">
                      <label htmlFor={`balasan-${asp.id}`} className="text-xs font-bold text-slate-700">
                        Berikan Balasan
                      </label>
                      <textarea
                        id={`balasan-${asp.id}`}
                        name="balasan"
                        rows={3}
                        required
                        minLength={5}
                        maxLength={2000}
                        placeholder="Tulis balasan..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                        defaultValue={asp.balasan || ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`status-${asp.id}`} className="text-xs font-bold text-slate-700">
                        Update Status
                      </label>
                      <select
                        id={`status-${asp.id}`}
                        name="status"
                        defaultValue={asp.status !== "PENDING" ? asp.status : "DIPROSES"}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      >
                        <option value="DIPROSES">Diproses</option>
                        <option value="SELESAI">Selesai</option>
                        <option value="DITOLAK">Ditolak</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                    >
                      <Reply className="w-4 h-4" />
                      Kirim Balasan
                    </button>
                  </form>

                  <form action={deleteAspirasi} className="mt-3">
                    <input type="hidden" name="id" value={asp.id} />
                    <DeleteConfirmButton
                      action={deleteAspirasi}
                      itemId={asp.id}
                      message="Hapus aspirasi ini? Tindakan tidak dapat dibatalkan."
                      formChildren={<input type="hidden" name="id" value={asp.id} />}
                      className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all border border-red-200"
                      title="Hapus Aspirasi"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Konfigurasi Data Aspirasi */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Aspirasi</h2>
            <p className="text-xs text-slate-600 mt-0.5">Ringkasan sistem aspirasi</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Aspirasi</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Aspirasi</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Tingkat Respon</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              {totalAll > 0 ? Math.round((totalSelesai / totalAll) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Perlu Tindakan</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPending + totalDiproses} Aspirasi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
