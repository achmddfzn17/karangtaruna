import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Edit Program" };

interface EditProgramPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProgramPage({ params }: EditProgramPageProps) {
  const { id } = await params;

  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) notFound();

  async function updateProgram(formData: FormData) {
    "use server";
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const icon = formData.get("icon") as string;
    const statusRaw = formData.get("status") as string;
    const urutanRaw = formData.get("urutan") as string;

    if (!nama || nama.length < 3) throw new Error("Nama program minimal 3 karakter");

    const status = statusRaw === "true";
    const urutan = Number(urutanRaw) || 0;

    try {
      await prisma.program.update({
        where: { id },
        data: {
          nama,
          deskripsi: deskripsi || null,
          icon: icon || null,
          status,
          urutan,
        },
      });
    } catch {
      throw new Error("Gagal mengupdate program");
    }

    revalidatePath("/dashboard/program");
    revalidatePath("/program");
    redirect("/dashboard/program");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/program"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Program</h1>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{program.nama}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={updateProgram} className="space-y-5">
          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="nama" className="text-[12px] font-bold text-slate-600">
              Nama Program <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              required
              defaultValue={program.nama}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label htmlFor="deskripsi" className="text-[12px] font-bold text-slate-600">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={4}
              defaultValue={program.deskripsi || ""}
              placeholder="Jelaskan tujuan dan manfaat program ini..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label htmlFor="icon" className="text-[12px] font-bold text-slate-600">
              Nama Icon Lucide (Opsional)
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              defaultValue={program.icon || ""}
              placeholder="Contoh: Heart, Star, Users, BookOpen"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Row: Urutan & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="urutan" className="text-[12px] font-bold text-slate-600">
                Urutan Tampil
              </label>
              <input
                id="urutan"
                name="urutan"
                type="number"
                defaultValue={program.urutan}
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-[12px] font-bold text-slate-600">
                Status Aktif
              </label>
              <select
                id="status"
                name="status"
                defaultValue={String(program.status)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/program"
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
