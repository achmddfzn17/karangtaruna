import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const metadata = { title: "Tambah Admin" };

export default function TambahAdminPage() {
  async function createAdmin(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "SUPER_ADMIN";
    const jabatan = formData.get("jabatan") as string;
    const phone = formData.get("phone") as string;

    if (!name || !email || !password) {
      throw new Error("Nama, email, dan password wajib diisi");
    }

    if (password.length < 8) {
      throw new Error("Password minimal 8 karakter");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "ADMIN",
        },
      });

      await prisma.admin.create({
        data: {
          userId: user.id,
          jabatan: jabatan || null,
          phone: phone || null,
        },
      });
    } catch {
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
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Admin</h1>
          <p className="text-sm text-slate-400 mt-0.5">Buat akun administrator baru</p>
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
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-[12px] font-bold text-slate-600">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
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
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
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
