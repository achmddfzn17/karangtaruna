import { requireAdmin } from "@/lib/auth-helpers";
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
  Settings,
  Activity,
  TrendingUp,
} from "lucide-react";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { createPolling, togglePollingStatus, deletePolling } from "./actions";

export const metadata = { title: "Kelola E-Voting" };

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string; deleted?: string }>;
}

export default async function AdminVotingPage({ searchParams }: PageProps) {
  // ✅ Auth check with helper
  await requireAdmin();

  const params = await searchParams;

  // Auto-nonaktifkan polling yang sudah kadaluarsa
  const now = new Date();
  await prisma.polling.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: now, not: null },
    },
    data: { isActive: false },
  });

  // Parallel queries for data and stats
  const [polls, totalActive, totalInactive, totalExpired, totalVotesAll] = await Promise.all([
    prisma.polling.findMany({
      include: {
        options: {
          include: { _count: { select: { votes: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.polling.count({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.polling.count({
      where: { isActive: false },
    }),
    prisma.polling.count({
      where: {
        expiresAt: { lt: now, not: null },
      },
    }),
    prisma.vote.count(),
  ]);

  const totalPolls = polls.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <VoteIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen E-Voting
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola pemungutan suara digital untuk keputusan organisasi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
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
            ? "Voting berhasil dibuat"
            : params.deleted
            ? "Voting telah dihapus"
            : params.error ? decodeURIComponent(params.error) : "Terjadi kesalahan"}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <VoteIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalPolls}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Voting</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalActive}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Sedang Berjalan</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Selesai</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalInactive + totalExpired}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Non-Aktif / Expired</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Suara</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalVotesAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Suara Masuk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Buat Voting Baru
              </h2>
              <p className="text-xs text-slate-500 mt-1">Form pembuatan polling</p>
            </div>
            <div className="p-6">
              <form action={createPolling} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Judul Voting <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="judul"
                    type="text"
                    required
                    minLength={5}
                    maxLength={200}
                    placeholder="Contoh: Pemilihan Ketua Panitia"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Deskripsi (Opsional)</label>
                  <textarea
                    name="deskripsi"
                    rows={2}
                    maxLength={1000}
                    placeholder="Penjelasan singkat..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pilihan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="options"
                    rows={3}
                    required
                    placeholder="Nama A, Nama B, Nama C"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                  <p className="text-[10px] text-slate-500">Pisahkan dengan koma, minimal 2 pilihan</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                    Kadaluarsa (Opsional)
                  </label>
                  <input
                    name="expiresAt"
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <p className="text-[10px] text-slate-500">
                    Voting akan otomatis nonaktif setelah tanggal ini
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                >
                  <Plus className="w-4 h-4" />
                  Publikasikan Voting
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* List & Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <VoteIcon className="w-5 h-5 text-blue-600" />
                  Daftar Voting ({polls.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {totalActive} aktif, {totalInactive + totalExpired} non-aktif
                </p>
              </div>
            </div>

            {polls.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
                  <VoteIcon className="w-12 h-12 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Voting</p>
                <p className="text-sm text-slate-500">
                  Buat voting baru menggunakan form di samping
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {polls.map((poll) => {
                  const totalVotes = poll.options.reduce(
                    (sum, opt) => sum + opt._count.votes,
                    0
                  );
                  const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < now : false;

                  return (
                    <div
                      key={poll.id}
                      className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
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
                            <h3 className="text-base font-extrabold text-slate-900">{poll.judul}</h3>
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
                                  aria-label={poll.isActive ? "Nonaktifkan voting" : "Aktifkan voting"}
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
                            <DeleteConfirmButton
                              action={deletePolling}
                              itemId={poll.id}
                              message="Hapus voting ini? Semua suara akan ikut terhapus."
                              title="Hapus voting"
                            />
                          </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <BarChart3 className="w-4 h-4" />
                              Hasil Sementara
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
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
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Konfigurasi Data Voting */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data E-Voting</h2>
            <p className="text-xs text-slate-600 mt-0.5">Ringkasan sistem pemungutan suara</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Voting</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalPolls} Voting</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Voting Aktif</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalActive} Voting</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Suara</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalVotesAll} Suara</p>
          </div>
        </div>
      </div>
    </div>
  );
}
