import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  ToggleRight,
  LogIn,
  LogOut,
  FileText,
  Search,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import Link from "next/link";

export const metadata = { title: "Log Aktivitas" };

const PER_PAGE = 30;

const actionIcon: Record<string, React.ReactNode> = {
  CREATE: <Plus className="w-3.5 h-3.5" />,
  UPDATE: <Pencil className="w-3.5 h-3.5" />,
  DELETE: <Trash2 className="w-3.5 h-3.5" />,
  TOGGLE: <ToggleRight className="w-3.5 h-3.5" />,
  LOGIN: <LogIn className="w-3.5 h-3.5" />,
  LOGOUT: <LogOut className="w-3.5 h-3.5" />,
  PUBLISH: <FileText className="w-3.5 h-3.5" />,
  ARCHIVE: <FileText className="w-3.5 h-3.5" />,
};

const actionColor: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  TOGGLE: "bg-purple-100 text-purple-700",
  LOGIN: "bg-slate-100 text-slate-600",
  LOGOUT: "bg-slate-100 text-slate-600",
  PUBLISH: "bg-emerald-100 text-emerald-700",
  ARCHIVE: "bg-amber-100 text-amber-700",
};

const moduleColor: Record<string, string> = {
  anggota: "bg-blue-50 text-blue-600",
  kegiatan: "bg-sky-50 text-sky-600",
  keuangan: "bg-emerald-50 text-emerald-600",
  berita: "bg-purple-50 text-purple-600",
  artikel: "bg-violet-50 text-violet-600",
  galeri: "bg-pink-50 text-pink-600",
  voting: "bg-orange-50 text-orange-600",
  aspirasi: "bg-amber-50 text-amber-600",
  admin: "bg-red-50 text-red-600",
  sus: "bg-teal-50 text-teal-600",
  program: "bg-indigo-50 text-indigo-600",
  auth: "bg-slate-50 text-slate-600",
};

export default async function LogAktivitasPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; action?: string; q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const moduleFilter = params.module ?? "";
  const actionFilter = params.action ?? "";
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: any = {
    ...(moduleFilter ? { module: moduleFilter } : {}),
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(q
      ? {
          OR: [
            { userName: { contains: q, mode: "insensitive" } },
            { targetName: { contains: q, mode: "insensitive" } },
            { detail: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const baseUrl = `/dashboard/log?module=${moduleFilter}&action=${actionFilter}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const modules = [
    "anggota", "kegiatan", "keuangan", "berita", "artikel",
    "galeri", "voting", "aspirasi", "admin", "sus", "program", "auth",
  ];
  const actions = ["CREATE", "UPDATE", "DELETE", "TOGGLE", "LOGIN", "LOGOUT", "PUBLISH", "ARCHIVE"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Log Aktivitas</h1>
          <p className="text-sm text-slate-400 mt-1">Rekam jejak semua aksi yang dilakukan admin</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
          <Activity className="w-3.5 h-3.5" />
          Hanya Super Admin
        </div>
      </div>

      {/* Filter */}
      <form
        method="GET"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[180px] space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Nama admin, target, detail..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modul</label>
          <select
            name="module"
            defaultValue={moduleFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">Semua Modul</option>
            {modules.map((m) => (
              <option key={m} value={m} className="capitalize">{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</label>
          <select
            name="action"
            defaultValue={actionFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">Semua Aksi</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Filter
        </button>
        {(moduleFilter || actionFilter || q) && (
          <Link
            href="/dashboard/log"
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition-colors"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Waktu</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Admin</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Aksi</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Modul</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Target</th>
                <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Belum ada log aktivitas</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {log.userName || "System"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${
                          actionColor[log.action] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {actionIcon[log.action]}
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize ${
                          moduleColor[log.module] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 max-w-[160px] truncate">
                      {log.targetName || log.targetId || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                      {log.detail || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500 font-medium py-3">
              Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} dari {total} log
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
