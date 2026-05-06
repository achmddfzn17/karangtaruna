import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { UserCog, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Kelola Admin" };

export default async function KelolaAdminPage() {
  const adminUsers = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] }
    },
    include: { admin: true },
    orderBy: { createdAt: "asc" }
  });

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Daftar pengguna dengan akses administrator</p>
        </div>
        <Link
          href="/dashboard/kelola-admin/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Admin
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Nama User</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Email</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Role</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Jabatan</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <UserCog className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada data admin</p>
                  </td>
                </tr>
              ) : (
                adminUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name?.charAt(0) || "A"}
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{user.name || "Admin"}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${roleColor[user.role]}`}>
                        <ShieldCheck className="w-3 h-3" />
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">
                      {user.admin?.jabatan || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
