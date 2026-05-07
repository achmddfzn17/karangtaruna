import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

export const metadata = { title: "Edit Kegiatan" };

interface EditKegiatanPageProps {
  params: Promise<{ id: string }>;
}

function toDatetimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditKegiatanPage({ params }: EditKegiatanPageProps) {
  const { id } = await params;

  const kegiatan = await prisma.kegiatan.findUnique({ where: { id } });
  if (!kegiatan) notFound();

  async function updateKegiatan(formData: FormData) {
    "use server";
    const nama = formData.get("nama") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const jenis = formData.get("jenis") as string;
    const tanggalMulai = formData.get("tanggalMulai") as string;
    const tanggalSelesai = formData.get("tanggalSelesai") as string;
    const lokasi = formData.get("lokasi") as string;
    const anggaran = formData.get("anggaran") as string;
    const status = formData.get("status") as string;
    const thumbnail = formData.get("thumbnail") as string;

    if (!nama || nama.length < 5) throw new Error("Nama kegiatan minimal 5 karakter");
    if (!tanggalMulai) throw new Error("Tanggal mulai wajib diisi");

    try {
      await prisma.kegiatan.update({
        where: { id },
        data: {
          nama,
          deskripsi: deskripsi || null,
          jenis: jenis as any,
          tanggalMulai: new Date(tanggalMulai),
          tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
          lokasi: lokasi || null,
          anggaran: anggaran ? parseFloat(anggaran) : null,
          status: status as any,
          thumbnail: thumbnail || null,
        },
      });
    } catch {
      throw new Error("Gagal mengupdate kegiatan");
    }

    revalidatePath("/dashboard/kegiatan");
    revalidatePath("/kegiatan");
    redirect("/dashboard/kegiatan");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kegiatan"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Kegiatan</h1>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{kegiatan.nama}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={updateKegiatan} className="space-y-5">
          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="nama" className="text-[12px] font-bold text-slate-600">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              name="nama"
              type="text"
              required
              defaultValue={kegiatan.nama}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Row: Jenis & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="jenis" className="text-[12px] font-bold text-slate-600">
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis"
                name="jenis"
                defaultValue={kegiatan.jenis}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="SOSIAL">Sosial</option>
                <option value="PENDIDIKAN">Pendidikan</option>
                <option value="EKONOMI">Ekonomi</option>
                <option value="OLAHRAGA">Olahraga</option>
                <option value="SENI_BUDAYA">Seni &amp; Budaya</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-[12px] font-bold text-slate-600">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={kegiatan.status}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="UPCOMING">Akan Datang</option>
                <option value="ONGOING">Sedang Berjalan</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Row: Tanggal Mulai & Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tanggalMulai" className="text-[12px] font-bold text-slate-600">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggalMulai"
                name="tanggalMulai"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocal(kegiatan.tanggalMulai)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tanggalSelesai" className="text-[12px] font-bold text-slate-600">
                Tanggal Selesai (Opsional)
              </label>
              <input
                id="tanggalSelesai"
                name="tanggalSelesai"
                type="datetime-local"
                defaultValue={toDatetimeLocal(kegiatan.tanggalSelesai)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Lokasi */}
          <div className="space-y-1.5">
            <label htmlFor="lokasi" className="text-[12px] font-bold text-slate-600">
              Lokasi (Opsional)
            </label>
            <input
              id="lokasi"
              name="lokasi"
              type="text"
              defaultValue={kegiatan.lokasi || ""}
              placeholder="Contoh: Balai RW 05"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Anggaran */}
          <div className="space-y-1.5">
            <label htmlFor="anggaran" className="text-[12px] font-bold text-slate-600">
              Anggaran (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-500 font-semibold text-sm">Rp</span>
              <input
                id="anggaran"
                name="anggaran"
                type="number"
                defaultValue={kegiatan.anggaran ?? ""}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
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
              defaultValue={kegiatan.deskripsi || ""}
              placeholder="Jelaskan detail kegiatan ini..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          {/* Thumbnail */}
          <ThumbnailUpload
            name="thumbnail"
            defaultUrl={kegiatan.thumbnail}
            folder="kegiatan"
            label="Thumbnail Kegiatan (Opsional)"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/kegiatan"
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
