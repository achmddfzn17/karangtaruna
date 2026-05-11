import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const metadata = { title: "Tambah Admin" };

const VALID_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

export default async function TambahAdminPage() {
  // ✅ Auth check: Only SUPER_ADMIN can access
  await requireSuperAdmin();

  async function createAdmin(formData: FormData) {
    "use server";
    
    // ✅ Auth check in server action
    await requireSuperAdmin();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const roleRaw = formData.get("role") as string;
    const jabatan = (formData.get("jabatan") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    // ✅ Enhanced validation
    if (!name || name.length < 3) {
      throw new Error("Nama minimal 3 karakter");
    }
    if (name.length > 100) {
      throw new Error("Nama maksimal 100 karakter");
    }

    if (!email) {
      throw new Error("Email wajib diisi");
    }
    
    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format email tidak valid");
    }
    
    if (email.length > 255) {
      throw new Error("Email terlalu panjang");
    }

    if (!password) {
      throw new Error("Password wajib diisi");
    }
    if (password.length < 8) {
      throw new Error("Password minimal 8 karakter");
    }
    if (password.length > 100) {
      throw new Error("Password maksimal 100 karakter");
    }

    // ✅ Role validation
    const role: Role = VALID_ROLES.includes(roleRaw as Role)
      ? (roleRaw as Role)
      : "ADMIN";

    // ✅ Phone validation (Indonesia format)
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

    // Check email availability
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Use transaction to prevent orphan records
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

        await tx.admin.create({
          data: {
            userId: user.id,
            jabatan: jabatan || null,
            phone: phone || null,
          },
        });
      });
    } catch (error) {
      // ✅ Proper error logging
      console.error("[CREATE_ADMIN_ERROR]", error);
      
      // Handle Prisma unique constraint
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "P2002") {
          throw new Error("Email sudah terdaftar");
        }
      }
      
      throw new Error("Gagal membuat akun admin");
    }

    revalidatePath("/dashboard/kelola-admin");
    redirect("/dashboard/kelola-admin");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kelola-admin"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
          aria-label="Kembali ke daftar admin"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">Buat akun administrator baru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={createAdmin} className="space-y-5">
          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[12px] font-bold text-slate-600">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={100}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[12px] font-bold text-slate-600">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[12px] font-bold text-slate-600">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
            <p className="text-[10px] text-slate-400">8-100 karakter, gunakan kombinasi huruf dan angka</p>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-[12px] font-bold text-slate-600">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="ADMIN"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <p className="text-[10px] text-slate-400">Super Admin memiliki akses penuh termasuk kelola admin</p>
          </div>

          {/* Jabatan */}
          <div className="space-y-1.5">
            <label htmlFor="jabatan" className="text-[12px] font-bold text-slate-600">
              Jabatan (Opsional)
            </label>
            <input
              id="jabatan"
              name="jabatan"
              type="text"
              maxLength={100}
              placeholder="Contoh: Sekretaris, Bendahara"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-[12px] font-bold text-slate-600">
              No. HP (Opsional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              pattern="^(\+62|62|0)[0-9]{9,13}$"
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
            <p className="text-[10px] text-slate-400">Format: 081234567890 atau +6281234567890</p>
          </div>

          {/* Actions */}
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
              <UserPlus className="w-4 h-4" />
              Buat Akun Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
