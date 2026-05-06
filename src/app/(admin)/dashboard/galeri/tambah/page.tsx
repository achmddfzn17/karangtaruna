import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Tambah Dokumentasi Galeri" };

export default async function TambahGaleriPage() {
  const kegiatanList = await prisma.kegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
    select: { id: true, nama: true },
  });

  async function createGaleri(formData: FormData) {
    "use server";
    const judul = formData.get("judul") as string;
    const url = formData.get("url") as string;
    const type = formData.get("type") as "FOTO" | "VIDEO";
    const deskripsi = formData.get("deskripsi") as string;
    const kegiatanId = formData.get("kegiatanId") as string;

    if (!judul || !url) throw new Error("Judul dan URL wajib diisi");

    try {
      await prisma.galeriItem.create({
        data: {
          judul,
          url,
          type: type || "FOTO",
          deskripsi: deskripsi || null,
          kegiatanId: kegiatanId || null,
        },
      });
    } catch {
      throw new Error("Gagal menyimpan data galeri");
    }

    revalidatePath("/dashboard/galeri");
    redirect("/dashboard/galeri");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/galeri"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Dokumentasi</h1>
          <p className="text-sm text-slate-400 mt-0.5">Unggah foto atau video kegiatan</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={createGaleri} className="space-y-5">
          {/* Judul */}
          <div className="space-y-1.5">
            <label htmlFor="judul" className="text-[12px] font-bold text-slate-600">
              Judul Dokumentasi <span className="text-red-500">*</span>
            </label>
            <input
              id="judul"
              name="judul"
              type="text"
              required
              placeholder="Contoh: Foto Kegiatan Bakti Sosial 2024"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-[12px] font-bold text-slate-600">
              URL Foto / Video <span className="text-red-500">*</span>
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              placeholder="https://example.com/foto.jpg"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
            <p className="text-[11px] text-slate-400">Masukkan URL langsung dari hosting gambar atau video (Google Drive, Imgur, dll.)</p>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-[12px] font-bold text-slate-600">
              Tipe Media
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="FOTO">Foto</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>

          {/* Kegiatan */}
          <div className="space-y-1.5">
            <label htmlFor="kegiatanId" className="text-[12px] font-bold text-slate-600">
              Kegiatan Terkait (Opsional)
            </label>
            <select
              id="kegiatanId"
              name="kegiatanId"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">-- Tidak terkait kegiatan --</option>
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label htmlFor="deskripsi" className="text-[12px] font-bold text-slate-600">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              placeholder="Keterangan singkat tentang dokumentasi ini..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/galeri"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              Simpan Dokumentasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
