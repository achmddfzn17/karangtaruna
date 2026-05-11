import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { 
  UserCog, Plus, ShieldCheck, Pencil, Search, Filter, 
  Settings, Shield, Users, Mail, Briefcase, Calendar
} from "lucide-react";
import Link from "next/link";
import DeleteAdminButton from "@/components/admin/DeleteAdminButton";
import { Prisma, Role } from "@prisma/client";

export const metadata = { title: "Kelola Admin" };

type AdminWithProfile = Prisma.UserGetPayload<{
  include: { admin: true };
}>;

const VALID_ROLES: (Role | "SEMUA")[] = ["SEMUA", "ADMIN", "SUPER_ADMIN"];

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
}

export default async function KelolaAdminPage({ searchParams }: PageProps) {
  // ✅ AUTH CHECK: Require SUPER_ADMIN role only
  const session = await requireSuperAdmin();
  const currentUserId = session.user.id;
  const currentRole = session.user.role;

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  
  // Safe role filter validation
  const roleParam = params.role;
  const roleFilter: Role | "SEMUA" = 
    roleParam && VALID_ROLES.includes(roleParam as Role | "SEMUA")
      ? (roleParam as Role | "SEMUA")
      : "SEMUA";

  // Build where condition
  const whereConditions: Prisma.UserWhereInput[] = [
    { role: { in: ["ADMIN", "SUPER_ADMIN"] } }
  ];
  
  if (q) {
    whereConditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  
  if (roleFilter !== "SEMUA") {
    whereConditions.push({ role: roleFilter });
  }

  const where: Prisma.UserWhereInput = { AND: whereConditions };

  // Parallel queries for data and stats
  const [adminUsers, totalSuperAdmin, totalAdmin] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { admin: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const totalAll = totalSuperAdmin + totalAdmin;

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: "bg-indigo-100 text-indigo-700 border-indigo-200",
    ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <UserCog className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Kelola Admin
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola hak akses dan profil administrator sistem Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Pengelolaan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Tombol Pengelolaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data administrator</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {/* Tambah Admin */}
            <Link
              href="/dashboard/kelola-admin/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              aria-label="Tambah Administrator Baru"
            >
              <Plus className="w-4 h-4" />
              Tambah Admin
            </Link>

            {/* Search */}
            <form method="GET" className="flex gap-2">
              <input type="hidden" name="role" value={roleFilter} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari nama atau email..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
                  aria-label="Cari admin"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
              {q && (
                <Link
                  href={`/dashboard/kelola-admin?role=${roleFilter}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* Filter Role */}
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-slate-500" />
              <Link
                href={`/dashboard/kelola-admin?role=SEMUA${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  roleFilter === "SEMUA" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua ({totalAll})
              </Link>
              <Link
                href={`/dashboard/kelola-admin?role=SUPER_ADMIN${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  roleFilter === "SUPER_ADMIN" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Super Admin ({totalSuperAdmin})
              </Link>
              <Link
                href={`/dashboard/kelola-admin?role=ADMIN${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  roleFilter === "ADMIN" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Admin ({totalAdmin})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Administrator</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-500 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Super</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalSuperAdmin}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Super Administrator</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Admin</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAdmin}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Administrator</p>
        </div>
      </div>

      {/* Tabel Data Admin */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600" />
              Tabel Data Administrator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {adminUsers.length} administrator
              {(q || roleFilter !== "SEMUA") && " (difilter)"}
            </p>
          </div>
        </div>

        {adminUsers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <UserCog className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Data Administrator</p>
            <p className="text-sm text-slate-500 mb-6">
              {q || roleFilter !== "SEMUA"
                ? "Tidak ada admin yang sesuai filter"
                : "Mulai tambahkan administrator baru"}
            </p>
            {!q && roleFilter === "SEMUA" && (
              <Link
                href="/dashboard/kelola-admin/tambah"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Admin
              </Link>
            )}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminUsers.map((user: AdminWithProfile) => {
              const isSelf = user.id === currentUserId;
              return (
                <div
                  key={user.id}
                  className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Header with Avatar & Role Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl shrink-0 shadow-lg shadow-blue-500/30">
                      {user.name?.charAt(0) || "A"}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleColor[user.role]}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {roleLabel[user.role]}
                    </span>
                  </div>

                  {/* Name & Self Badge */}
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {user.name || "Administrator"}
                    </h3>
                    {isSelf && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        <Shield className="w-2.5 h-2.5" />
                        Profil Anda
                      </span>
                    )}
                  </div>

                  {/* Info Details */}
                  <div className="space-y-2 mb-4">
                    {/* Email */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1 break-all">{user.email}</span>
                    </div>

                    {/* Jabatan */}
                    {user.admin?.jabatan && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{user.admin.jabatan}</span>
                      </div>
                    )}

                    {/* NIP */}
                    {user.admin?.nip && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-mono">NIP: {user.admin.nip}</span>
                      </div>
                    )}

                    {/* Tanggal Terdaftar */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Terdaftar {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/dashboard/kelola-admin/edit/${user.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors"
                      aria-label={`Edit admin ${user.name || "Administrator"}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    {/* Hanya SUPER_ADMIN yang bisa hapus, dan tidak bisa hapus diri sendiri */}
                    {currentRole === "SUPER_ADMIN" && (
                      <DeleteAdminButton
                        id={user.id}
                        nama={user.name || "Admin"}
                        isSelf={isSelf}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Konfigurasi Data Admin */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Administrator</h2>
            <p className="text-xs text-slate-600 mt-0.5">Informasi hak akses sistem administrator</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Administrator</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Admin</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Super Administrator</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalSuperAdmin} Super Admin</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Role Anda</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{roleLabel[currentRole]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
