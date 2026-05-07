import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";
import TagsInput from "@/components/admin/TagsInput";

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
    const thumbnail = formData.get("thumbnail") as string;
    const tagsRaw = formData.get("tags") as string;
    let tags: string[] = [];
    try { tags = tagsRaw ? JSON.parse(tagsRaw) : []; } catch {}

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
          thumbnail: thumbnail || null,
          tags,
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

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

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
              className={inputCls}
            />
          </div>

          {/* Kategori & Status */}
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
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-[12px] font-bold text-slate-600">
                Status Publikasi
              </label>
              <select id="status" name="status" defaultValue={artikel.status} className={inputCls}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <ThumbnailUpload
            name="thumbnail"
            defaultUrl={artikel.thumbnail}
            folder="artikel"
            label="Thumbnail Artikel (Opsional)"
          />

          {/* Tags */}
          <TagsInput name="tags" defaultTags={artikel.tags} placeholder="Contoh: edukasi, inspirasi..." />

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
              className={`${inputCls} resize-none`}
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
              className={`${inputCls} resize-y`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href={`/artikel/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              <Eye className="w-4 h-4" />
              Lihat di Website
            </Link>
            <div className="flex items-center gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}
