import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Edit Admin" };

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { admin: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) notFound();

  async function updateAdmin(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const role = formData.get("role") as "ADMIN" | "SUPER_ADMIN";
    const jabatan = (formData.get("jabatan") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name) throw new Error("Nama wajib diisi");

    // Use transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Update user data
      await tx.user.update({
        where: { id },
        data: { name, role },
      });

      // Check if admin record exists
      const existingAdmin = await tx.admin.findUnique({
        where: { userId: id },
      });

      if (existingAdmin) {
        // Update existing admin record
        await tx.admin.update({
          where: { userId: id },
          data: { jabatan: jabatan || null, phone: phone || null },
        });
      } else {
        // Create new admin record
        await tx.admin.create({
          data: { userId: id, jabatan: jabatan || null, phone: phone || null },
        });
      }
    });

    revalidatePath("/dashboard/kelola-admin");
    redirect("/dashboard/kelola-admin");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kelola-admin"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Admin</h1>
          <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form action={updateAdmin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={user.name || ""}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`}
            />
            <p className="text-[11px] text-slate-400">Email tidak dapat diubah</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Role</label>
            <select name="role" defaultValue={user.role} className={inputCls}>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Jabatan (Opsional)</label>
            <input
              name="jabatan"
              type="text"
              defaultValue={user.admin?.jabatan || ""}
              placeholder="Contoh: Sekretaris, Bendahara"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">No. HP (Opsional)</label>
            <input
              name="phone"
              type="tel"
              defaultValue={user.admin?.phone || ""}
              placeholder="Contoh: 081234567890"
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/kelola-admin"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
