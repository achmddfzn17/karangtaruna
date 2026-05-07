import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";
import TagsInput from "@/components/admin/TagsInput";

export const metadata = { title: "Edit Berita" };

interface EditBeritaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const { slug } = await params;

  const berita = await prisma.berita.findUnique({ where: { slug } });
  if (!berita) notFound();

  const beritaPublishedAt = berita.publishedAt;

  async function updateBerita(formData: FormData) {
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
    if (!isi || isi.length < 10) throw new Error("Isi berita tidak boleh kosong");

    try {
      await prisma.berita.update({
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
            status === "PUBLISHED" && !beritaPublishedAt ? new Date() : beritaPublishedAt,
        },
      });
    } catch {
      throw new Error("Gagal mengupdate berita");
    }

    revalidatePath("/dashboard/berita");
    revalidatePath(`/berita/${slug}`);
    redirect("/dashboard/berita");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/berita"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Berita</h1>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{berita.judul}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={updateBerita} className="space-y-5">
          {/* Judul */}
          <div className="space-y-1.5">
            <label htmlFor="judul" className="text-[12px] font-bold text-slate-600">
              Judul Berita <span className="text-red-500">*</span>
            </label>
            <input
              id="judul"
              name="judul"
              type="text"
              required
              defaultValue={berita.judul}
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
                defaultValue={berita.kategori || ""}
                placeholder="Contoh: Pengumuman, Kegiatan"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-[12px] font-bold text-slate-600">
                Status Publikasi
              </label>
              <select id="status" name="status" defaultValue={berita.status} className={inputCls}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <ThumbnailUpload
            name="thumbnail"
            defaultUrl={berita.thumbnail}
            folder="berita"
            label="Thumbnail Berita (Opsional)"
          />

          {/* Tags */}
          <TagsInput name="tags" defaultTags={berita.tags} placeholder="Contoh: pengumuman, sosial..." />

          {/* Ringkasan */}
          <div className="space-y-1.5">
            <label htmlFor="ringkasan" className="text-[12px] font-bold text-slate-600">
              Ringkasan (Opsional)
            </label>
            <textarea
              id="ringkasan"
              name="ringkasan"
              rows={2}
              defaultValue={berita.ringkasan || ""}
              placeholder="Ringkasan singkat berita..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Isi */}
          <div className="space-y-1.5">
            <label htmlFor="isi" className="text-[12px] font-bold text-slate-600">
              Isi Berita <span className="text-red-500">*</span>
            </label>
            <textarea
              id="isi"
              name="isi"
              rows={14}
              required
              defaultValue={berita.isi}
              placeholder="Tulis isi berita di sini..."
              className={`${inputCls} resize-y`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href={`/berita/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
            >
              <Eye className="w-4 h-4" />
              Lihat di Website
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/berita"
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
