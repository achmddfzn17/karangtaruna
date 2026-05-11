import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { 
  Bell, Send, Users, User, CheckCircle2, Clock, TrendingUp, 
  Filter, Settings, Info, AlertTriangle, AlertCircle
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import DeleteNotifButton from "@/components/admin/DeleteNotifButton";
import NotificationFilters from "@/components/admin/NotificationFilters";

export const metadata = { title: "Kelola Notifikasi" };

export default async function NotifikasiAdminPage() {
  // Auth check
  await requireAdmin();

  const anggotaUsers = await prisma.user.findMany({
    where: { role: "ANGGOTA" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const recentNotifs = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });

  // Statistics
  const totalSent = recentNotifs.length;
  const totalRead = recentNotifs.filter(n => n.isRead).length;
  const totalUnread = totalSent - totalRead;
  const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

  async function kirimNotifikasi(formData: FormData) {
    "use server";
    
    await requireAdmin();

    const title = (formData.get("title") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();
    const type = (formData.get("type") as string) || "info";
    const target = formData.get("target") as string;

    // Enhanced validation
    if (!title || title.length < 3) throw new Error("Judul minimal 3 karakter");
    if (title.length > 200) throw new Error("Judul maksimal 200 karakter");
    if (!message || message.length < 5) throw new Error("Pesan minimal 5 karakter");
    if (message.length > 2000) throw new Error("Pesan maksimal 2000 karakter");
    
    const validTypes = ["info", "success", "warning", "error"];
    if (!validTypes.includes(type)) throw new Error("Tipe notifikasi tidak valid");

    try {
      if (target === "ALL") {
        const users = await prisma.user.findMany({
          where: { role: "ANGGOTA" },
          select: { id: true },
        });
        if (users.length === 0) {
          throw new Error("Tidak ada anggota untuk menerima notifikasi");
        }
        await prisma.notification.createMany({
          data: users.map((u) => ({ title, message, type, userId: u.id })),
        });
      } else {
        const targetUser = await prisma.user.findUnique({
          where: { id: target },
          select: { id: true, role: true },
        });
        if (!targetUser) throw new Error("Anggota target tidak ditemukan");
        
        await prisma.notification.create({
          data: { title, message, type, userId: target },
        });
      }
    } catch (error) {
      console.error("[KIRIM_NOTIFIKASI_ERROR]", error);
      if (error instanceof Error) throw error;
      throw new Error("Gagal mengirim notifikasi");
    }

    revalidatePath("/dashboard/notifikasi");
    revalidatePath("/member/notifikasi");
  }

  const typeOptions = [
    { value: "info", label: "Info" },
    { value: "success", label: "Sukses" },
    { value: "warning", label: "Peringatan" },
    { value: "error", label: "Penting" },
  ];

  const typeBadge: Record<string, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  const typeIcon: Record<string, string> = {
    info: "bg-gradient-to-br from-blue-500 to-blue-600",
    success: "bg-gradient-to-br from-green-500 to-green-600",
    warning: "bg-gradient-to-br from-amber-500 to-amber-600",
    error: "bg-gradient-to-br from-red-500 to-red-600",
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all hover:border-slate-300";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Notifikasi
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kirim pengumuman dan notifikasi ke anggota Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalSent}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Notifikasi Terkirim</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Dibaca</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalRead}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Sudah Dibaca</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalUnread}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Belum Dibaca</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{readRate}%</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Tingkat Baca</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Kirim */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Kirim Notifikasi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Buat pengumuman baru</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form action={kirimNotifikasi} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select name="target" required className={inputCls} aria-label="Pilih tujuan">
                    <option value="ALL">Semua Anggota ({anggotaUsers.length} orang)</option>
                    {anggotaUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    Tipe Notifikasi
                  </label>
                  <select name="type" className={inputCls} aria-label="Pilih tipe notifikasi">
                    {typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="Contoh: Pengumuman Rapat Bulanan"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-slate-400">3-200 karakter</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={5}
                    placeholder="Tulis isi notifikasi dengan detail..."
                    className={`${inputCls} resize-none`}
                  />
                  <p className="text-[10px] text-slate-400">5-2000 karakter</p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                >
                  <Send className="w-4 h-4" />
                  Kirim Notifikasi
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Riwayat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Riwayat Notifikasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{recentNotifs.length} notifikasi terkirim</p>
                </div>
                <NotificationFilters />
              </div>
            </div>

            {recentNotifs.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
                  <Bell className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Notifikasi</p>
                <p className="text-sm text-slate-500">Notifikasi yang Anda kirim akan muncul di sini</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentNotifs.map((n) => (
                  <div
                    key={n.id}
                    className="group flex items-start gap-4 px-6 py-5 hover:bg-blue-50/40 transition-all duration-200"
                  >
                    {/* Icon */}
                    <div className={`p-3 ${typeIcon[n.type] || typeIcon.info} rounded-xl shrink-0 shadow-sm`}>
                      <Bell className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            typeBadge[n.type] || typeBadge.info
                          }`}
                        >
                          {n.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          {n.userId ? (
                            <>
                              <User className="w-3.5 h-3.5" /> 
                              {n.user?.name || n.user?.email || "Anggota"}
                            </>
                          ) : (
                            <>
                              <Users className="w-3.5 h-3.5" /> 
                              Broadcast ke semua
                            </>
                          )}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {n.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {n.isRead ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah dibaca
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Belum dibaca
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <DeleteNotifButton id={n.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Konfigurasi Notifikasi */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Notifikasi</h2>
            <p className="text-xs text-slate-600 mt-0.5">Informasi sistem notifikasi</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Notifikasi</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalSent} Notifikasi</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Target Anggota</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{anggotaUsers.length} Anggota</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Engagement Rate</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{readRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
