import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

export const metadata = { title: "Edit Admin" };

const VALID_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Auth check: Only SUPER_ADMIN can access
  const session = await requireSuperAdmin();
  const currentUserId = session.user.id;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { admin: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) notFound();

  const isSelf = user.id === currentUserId;

  async function updateAdmin(formData: FormData) {
    "use server";
    
    // ✅ Auth check in server action
    const currentSession = await requireSuperAdmin();
    const currentId = currentSession.user.id;

    const name = (formData.get("name") as string)?.trim();
    const roleRaw = formData.get("role") as string;
    const jabatan = (formData.get("jabatan") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    // ✅ Validation
    if (!name || name.length < 3) {
      throw new Error("Nama minimal 3 karakter");
    }
    if (name.length > 100) {
      throw new Error("Nama maksimal 100 karakter");
    }

    // ✅ Role validation
    if (!VALID_ROLES.includes(roleRaw as Role)) {
      throw new Error("Role tidak valid");
    }
    const newRole = roleRaw as Role;

    // ✅ Phone validation
    if (phone) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error("Format nomor HP tidak valid (gunakan format: 081234567890)");
      }
    }

    // ✅ Jabatan validation
    if (jabatan && jabatan.length > 100) {
      throw new Error("Jabatan maksimal 100 karakter");
    }

    // ✅ CRITICAL: Prevent self-demotion
    if (id === currentId && newRole !== "SUPER_ADMIN") {
      throw new Error(
        "Anda tidak bisa mengubah role diri sendiri. Minta Super Admin lain untuk mengubah role Anda."
      );
    }

    // ✅ CRITICAL: Prevent removing last SUPER_ADMIN
    if (newRole === "ADMIN") {
      // Check if target user is currently SUPER_ADMIN
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (targetUser?.role === "SUPER_ADMIN") {
        const superAdminCount = await prisma.user.count({
          where: { role: "SUPER_ADMIN" },
        });

        if (superAdminCount <= 1) {
          throw new Error(
            "Tidak bisa menurunkan role Super Admin terakhir. Sistem harus memiliki minimal 1 Super Admin."
          );
        }
      }
    }

    try {
      // Use transaction to prevent race conditions
      await prisma.$transaction(async (tx) => {
        // Update user data
        await tx.user.update({
          where: { id },
          data: { name, role: newRole },
        });

        // Upsert admin record
        await tx.admin.upsert({
          where: { userId: id },
          create: {
            userId: id,
            jabatan: jabatan || null,
            phone: phone || null,
          },
          update: {
            jabatan: jabatan || null,
            phone: phone || null,
          },
        });
      });
    } catch (error) {
      console.error("[UPDATE_ADMIN_ERROR]", error);
      if (error instanceof Error) throw error;
      throw new Error("Gagal memperbarui data admin");
    }

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
          aria-label="Kembali ke daftar admin"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Warning for Self-Edit */}
      {isSelf && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Anda sedang mengedit profil sendiri</p>
            <p className="text-xs text-amber-700 mt-1">
              Anda tidak dapat mengubah role Anda sendiri. Untuk mengubah role, 
              minta Super Admin lain untuk melakukannya.
            </p>
          </div>
        </div>
      )}

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
              minLength={3}
              maxLength={100}
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
              aria-label="Email (tidak dapat diubah)"
            />
            <p className="text-[11px] text-slate-400">Email tidak dapat diubah</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Role <span className="text-red-500">*</span>
            </label>
            <select 
              name="role" 
              defaultValue={user.role} 
              required
              disabled={isSelf}
              className={`${inputCls} ${isSelf ? "bg-slate-50 cursor-not-allowed" : ""}`}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {isSelf && (
              <p className="text-[11px] text-amber-600 font-medium">
                Role tidak dapat diubah untuk akun sendiri
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Jabatan (Opsional)</label>
            <input
              name="jabatan"
              type="text"
              maxLength={100}
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
              pattern="^(\+62|62|0)[0-9]{9,13}$"
              defaultValue={user.admin?.phone || ""}
              placeholder="Contoh: 081234567890"
              className={inputCls}
            />
            <p className="text-[10px] text-slate-400">Format: 081234567890 atau +6281234567890</p>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
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
