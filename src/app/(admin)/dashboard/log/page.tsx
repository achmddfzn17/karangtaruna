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
import { Prisma } from "@prisma/client";

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
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-rose-100 text-rose-700",
  TOGGLE: "bg-indigo-100 text-indigo-700",
  LOGIN: "bg-slate-100 text-slate-600",
  LOGOUT: "bg-slate-100 text-slate-600",
  PUBLISH: "bg-teal-100 text-teal-700",
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

interface PageProps {
  searchParams: Promise<{ module?: string; action?: string; q?: string; page?: string }>;
}

export default async function LogAktivitasPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Type-safe role check
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const moduleFilter = params.module ?? "";
  const actionFilter = params.action ?? "";
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where: Prisma.AuditLogWhereInput = {
    AND: [
      moduleFilter ? { module: moduleFilter } : {},
      actionFilter ? { action: actionFilter } : {},
      q
        ? {
            OR: [
              { userName: { contains: q, mode: "insensitive" } },
              { targetName: { contains: q, mode: "insensitive" } },
              { detail: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
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
          <p className="text-sm text-slate-500 mt-1 font-medium">Rekam jejak semua aksi yang dilakukan administrator</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-black text-amber-700 shadow-sm">
          <Activity className="w-4 h-4" />
          SUPER ADMIN ONLY
        </div>
      </div>

      {/* Filter */}
      <form
        method="GET"
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-wrap gap-4 items-end"
      >
        <div className="flex-1 min-w-[240px] space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Cari</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Cari admin, target, atau detail aksi..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Modul</label>
          <select
            name="module"
            defaultValue={moduleFilter}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">Semua Modul</option>
            {modules.map((m) => (
              <option key={m} value={m} className="capitalize">{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Aksi</label>
          <select
            name="action"
            defaultValue={actionFilter}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="">Semua Aksi</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-8 py-3 bg-slate-900 hover:bg-blue-600 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-slate-900/10 active:scale-95"
        >
          Terapkan
        </button>
        {(moduleFilter || actionFilter || q) && (
          <Link
            href="/dashboard/log"
            className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl transition-all active:scale-95"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Tabel */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Waktu</th>
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Administrator</th>
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Aksi</th>
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Modul</th>
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Target</th>
                <th className="text-left text-[11px] text-slate-500 font-black uppercase tracking-widest py-4 px-6">Detail Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-24 text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Activity className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Log aktivitas masih kosong</p>
                    <p className="text-sm mt-1">Sesuaikan filter atau tunggu aktivitas baru</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="py-4 px-6 text-[11px] font-bold text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                        {log.userName || "System"}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          actionColor[log.action] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {actionIcon[log.action]}
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider capitalize ${
                          moduleColor[log.module] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-600 max-w-[160px] truncate">
                        {log.targetName || log.targetId || "-"}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs font-medium text-slate-500 max-w-[240px] leading-relaxed">
                        {log.detail || "-"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="px-6 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {(page - 1) * PER_PAGE + 1} – {Math.min(page * PER_PAGE, total)} dari {total} entri log
            </p>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
