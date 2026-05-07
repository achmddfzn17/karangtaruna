import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Edit Kategori" };

export default async function EditKategoriPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kategori = await prisma.kategoriTransaksi.findUnique({ where: { id } });
  if (!kategori) notFound();

  async function updateKategori(formData: FormData) {
    "use server";
    const nama = (formData.get("nama") as string)?.trim();
    const jenis = formData.get("jenis") as "MASUK" | "KELUAR";
    const keterangan = (formData.get("keterangan") as string)?.trim();

    if (!nama || !jenis) throw new Error("Nama dan jenis wajib diisi");

    await prisma.kategoriTransaksi.update({
      where: { id },
      data: { nama, jenis, keterangan: keterangan || null },
    });

    revalidatePath("/dashboard/keuangan/kategori");
    revalidatePath("/dashboard/keuangan");
    redirect("/dashboard/keuangan/kategori");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/keuangan/kategori"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Kategori</h1>
          <p className="text-sm text-slate-400 mt-0.5">{kategori.nama}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form action={updateKategori} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              name="nama"
              type="text"
              required
              defaultValue={kategori.nama}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Jenis <span className="text-red-500">*</span>
            </label>
            <select name="jenis" required defaultValue={kategori.jenis} className={inputCls}>
              <option value="MASUK">Pemasukan</option>
              <option value="KELUAR">Pengeluaran</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Keterangan (Opsional)</label>
            <textarea
              name="keterangan"
              rows={2}
              defaultValue={kategori.keterangan || ""}
              placeholder="Deskripsi singkat kategori..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/keuangan/kategori"
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
