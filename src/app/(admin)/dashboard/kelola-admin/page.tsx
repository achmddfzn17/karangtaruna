import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { UserCog, Plus, ShieldCheck, Pencil } from "lucide-react";
import Link from "next/link";
import DeleteAdminButton from "@/components/admin/DeleteAdminButton";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Kelola Admin" };

type AdminWithProfile = Prisma.UserGetPayload<{
  include: { admin: true };
}>;

export default async function KelolaAdminPage() {
  // ✅ AUTH CHECK: Require SUPER_ADMIN role only
  // Will redirect to /login if not authenticated
  // Will redirect to /dashboard if authenticated but not super admin
  const session = await requireSuperAdmin();
  const currentUserId = session.user.id;
  const currentRole = session.user.role;

  const adminUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    include: { admin: true },
    orderBy: { createdAt: "asc" },
  });

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: "bg-indigo-50 text-indigo-600 border-indigo-100",
    ADMIN: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Admin</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manajemen hak akses dan profil administrator sistem</p>
        </div>
        <Link
          href="/dashboard/kelola-admin/tambah"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Admin
        </Link>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-6">Administrator</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Email</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Hak Akses</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Jabatan</th>
                <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] py-5 px-4">Terdaftar</th>
                <th className="py-5 px-6" />
              </tr>
            </thead>
            <tbody>
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserCog className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">Belum ada data administrator</p>
                  </td>
                </tr>
              ) : (
                adminUsers.map((user: AdminWithProfile) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-all group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {user.name?.charAt(0) || "A"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{user.name || "Administrator"}</p>
                            {isSelf && (
                              <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                Profil Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-sm font-medium text-slate-500">{user.email}</td>
                      <td className="py-5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${roleColor[user.role]}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-sm font-black text-slate-700">
                        {user.admin?.jabatan || "-"}
                      </td>
                      <td className="py-5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/kelola-admin/edit/${user.id}`}
                            className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                            title="Edit profil admin"
                          >
                            <Pencil className="w-4.5 h-4.5" />
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
