import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Bell, Send, Trash2, Users, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import DeleteNotifButton from "@/components/admin/DeleteNotifButton";

export const metadata = { title: "Kelola Notifikasi" };

export default async function NotifikasiAdminPage() {
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

  async function kirimNotifikasi(formData: FormData) {
    "use server";
    const title = (formData.get("title") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();
    const type = (formData.get("type") as string) || "info";
    const target = formData.get("target") as string; // "ALL" atau userId

    if (!title || !message) throw new Error("Judul dan pesan wajib diisi");

    if (target === "ALL") {
      // Kirim ke semua anggota
      const users = await prisma.user.findMany({
        where: { role: "ANGGOTA" },
        select: { id: true },
      });
      await prisma.notification.createMany({
        data: users.map((u) => ({ title, message, type, userId: u.id })),
      });
    } else {
      // Kirim ke satu user
      await prisma.notification.create({
        data: { title, message, type, userId: target },
      });
    }

    revalidatePath("/dashboard/notifikasi");
  }

  const typeOptions = [
    { value: "info", label: "Info", color: "text-blue-600" },
    { value: "success", label: "Sukses", color: "text-green-600" },
    { value: "warning", label: "Peringatan", color: "text-amber-600" },
    { value: "error", label: "Penting", color: "text-red-600" },
  ];

  const typeBadge: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-red-100 text-red-700",
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Kelola Notifikasi</h1>
        <p className="text-sm text-slate-400 mt-1">Kirim pengumuman dan notifikasi ke anggota</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Kirim */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-500" />
              Kirim Notifikasi
            </h2>
            <form action={kirimNotifikasi} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Tujuan <span className="text-red-500">*</span>
                </label>
                <select name="target" required className={inputCls}>
                  <option value="ALL">📢 Semua Anggota ({anggotaUsers.length} orang)</option>
                  {anggotaUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Tipe
                </label>
                <select name="type" className={inputCls}>
                  {typeOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Contoh: Pengumuman Rapat"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tulis isi notifikasi..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Kirim Notifikasi
              </button>
            </form>
          </div>
        </div>

        {/* Riwayat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                Riwayat Notifikasi ({recentNotifs.length})
              </h2>
            </div>

            {recentNotifs.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Belum ada notifikasi terkirim</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentNotifs.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            typeBadge[n.type] || typeBadge.info
                          }`}
                        >
                          {n.type.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          {n.userId ? (
                            <><User className="w-3 h-3" /> {n.user?.name || n.user?.email || "Anggota"}</>
                          ) : (
                            <><Users className="w-3 h-3" /> Broadcast</>
                          )}
                        </span>
                        <span className={`text-[10px] font-bold ${n.isRead ? "text-slate-400" : "text-blue-600"}`}>
                          {n.isRead ? "Dibaca" : "Belum dibaca"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{n.title}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                    <DeleteNotifButton id={n.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
