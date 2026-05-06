import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Edit Artikel" };

interface EditArtikelPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArtikelPage({ params }: EditArtikelPageProps) {
  const { slug } = await params;

  const artikel = await prisma.artikel.findUnique({ where: { slug } });
  if (!artikel) notFound();

  const artikelPublishedAt = artikel.publishedAt;

  async function updateArtikel(formData: FormData) {
    "use server";
    const judul = formData.get("judul") as string;
    const kategori = formData.get("kategori") as string;
    const status = formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    const ringkasan = formData.get("ringkasan") as string;
    const isi = formData.get("isi") as string;

    if (!judul || judul.length < 5) throw new Error("Judul minimal 5 karakter");
    if (!isi || isi.length < 10) throw new Error("Isi artikel tidak boleh kosong");

    try {
      await prisma.artikel.update({
        where: { slug },
        data: {
          judul,
          kategori: kategori || null,
          status,
          ringkasan: ringkasan || null,
          isi,
          publishedAt:
            status === "PUBLISHED" && !artikelPublishedAt ? new Date() : artikelPublishedAt,
        },
      });
    } catch {
      throw new Error("Gagal mengupdate artikel");
    }

    revalidatePath("/dashboard/artikel");
    revalidatePath(`/artikel/${slug}`);
    redirect("/dashboard/artikel");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/artikel"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Artikel</h1>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{artikel.judul}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={updateArtikel} className="space-y-5">
          {/* Judul */}
          <div className="space-y-1.5">
            <label htmlFor="judul" className="text-[12px] font-bold text-slate-600">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              id="judul"
              name="judul"
              type="text"
              required
              defaultValue={artikel.judul}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Row: Kategori & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="kategori" className="text-[12px] font-bold text-slate-600">
                Kategori
              </label>
              <input
                id="kategori"
                name="kategori"
                type="text"
                defaultValue={artikel.kategori || ""}
                placeholder="Contoh: Pendidikan, Sosial"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-[12px] font-bold text-slate-600">
                Status Publikasi
              </label>
              <select
                id="status"
                name="status"
                defaultValue={artikel.status}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="space-y-1.5">
            <label htmlFor="ringkasan" className="text-[12px] font-bold text-slate-600">
              Ringkasan (Opsional)
            </label>
            <textarea
              id="ringkasan"
              name="ringkasan"
              rows={2}
              defaultValue={artikel.ringkasan || ""}
              placeholder="Ringkasan singkat artikel..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Isi */}
          <div className="space-y-1.5">
            <label htmlFor="isi" className="text-[12px] font-bold text-slate-600">
              Isi Artikel <span className="text-red-500">*</span>
            </label>
            <textarea
              id="isi"
              name="isi"
              rows={14}
              required
              defaultValue={artikel.isi}
              placeholder="Tulis isi artikel di sini..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/artikel"
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
