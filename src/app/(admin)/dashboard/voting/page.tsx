import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Vote as VoteIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  CalendarClock,
} from "lucide-react";
import DeletePollingButton from "@/components/admin/DeletePollingButton";
import { createPolling, togglePollingStatus, deletePolling } from "./actions";

export const metadata = { title: "Kelola E-Voting" };

export default async function AdminVotingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; deleted?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const params = await searchParams;

  // Auto-nonaktifkan polling yang sudah kadaluarsa (optimized)
  const now = new Date();
  await prisma.polling.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: now, not: null },
    },
    data: { isActive: false },
  });

  const polls = await prisma.polling.findMany({
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Pagination: limit 50 polls
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola E-Voting</h1>
          <p className="text-sm text-slate-500 mt-1">
            Buat pemungutan suara digital untuk keputusan organisasi
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(params.success || params.deleted || params.error) && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
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
            ? "Voting berhasil dibuat."
            : params.deleted
            ? "Voting telah dihapus."
            : params.error ? decodeURIComponent(params.error) : "Terjadi kesalahan"}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Buat Voting Baru
            </h2>
            <form action={createPolling} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">Judul Voting</label>
                <input
                  name="judul"
                  type="text"
                  required
                  placeholder="Contoh: Pemilihan Ketua Panitia"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">Deskripsi (Opsional)</label>
                <textarea
                  name="deskripsi"
                  rows={2}
                  placeholder="Penjelasan singkat..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Pilihan <span className="text-slate-400 font-normal">(pisahkan dengan koma)</span>
                </label>
                <textarea
                  name="options"
                  rows={3}
                  required
                  placeholder="Contoh: Nama A, Nama B, Nama C"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              {/* Tanggal Kadaluarsa */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                  Tanggal Kadaluarsa (Opsional)
                </label>
                <input
                  name="expiresAt"
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400">
                  Voting akan otomatis nonaktif setelah tanggal ini.
                </p>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Publikasikan Voting
              </button>
            </form>
          </div>
        </div>

        {/* List & Results */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            <VoteIcon className="w-4 h-4 text-purple-500" />
            Daftar Voting ({polls.length})
          </h2>

          {polls.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
              <VoteIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Belum ada voting yang dibuat.</p>
            </div>
          ) : (
            polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, opt) => sum + opt._count.votes,
                0
              );
              const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < now : false;

              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isExpired
                                ? "bg-red-100 text-red-600"
                                : poll.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isExpired ? "Kadaluarsa" : poll.isActive ? "Aktif" : "Non-Aktif"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(poll.createdAt).toLocaleDateString("id-ID")}
                          </span>
                          {poll.expiresAt && (
                            <span
                              className={`text-[10px] font-bold flex items-center gap-1 ${
                                isExpired ? "text-red-500" : "text-amber-600"
                              }`}
                            >
                              <CalendarClock className="w-3 h-3" />
                              Berakhir:{" "}
                              {new Date(poll.expiresAt).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900">{poll.judul}</h3>
                        {poll.deskripsi && (
                          <p className="text-sm text-slate-500 mt-1">{poll.deskripsi}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isExpired && (
                          <form action={togglePollingStatus}>
                            <input type="hidden" name="id" value={poll.id} />
                            <input
                              type="hidden"
                              name="currentStatus"
                              value={String(poll.isActive)}
                            />
                            <button
                              type="submit"
                              title={poll.isActive ? "Nonaktifkan" : "Aktifkan"}
                              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              {poll.isActive ? (
                                <ToggleRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          </form>
                        )}
                        <DeletePollingButton action={deletePolling} pollingId={poll.id} />
                      </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <BarChart3 className="w-4 h-4" />
                          Hasil Sementara
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-extrabold text-blue-600">
                            {totalVotes} Suara
                          </span>
                        </div>
                      </div>

                      {poll.options.map((opt) => {
                        const percentage =
                          totalVotes > 0
                            ? Math.round((opt._count.votes / totalVotes) * 100)
                            : 0;
                        return (
                          <div key={opt.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-bold text-slate-700">{opt.label}</span>
                              <span className="font-extrabold text-slate-900">
                                {opt._count.votes} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
