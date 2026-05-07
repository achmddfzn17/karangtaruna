import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Save, FileImage } from "lucide-react";
import { notFound } from "next/navigation";
import { updateTransaksi } from "../../actions";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

export const metadata = { title: "Edit Transaksi" };

export default async function EditTransaksiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [transaksi, kategoriList] = await Promise.all([
    prisma.transaksiKeuangan.findUnique({ where: { id }, include: { kategori: true } }),
    prisma.kategoriTransaksi.findMany({ orderBy: { nama: "asc" } }),
  ]);

  if (!transaksi) notFound();

  const tanggalValue = new Date(transaksi.tanggal).toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/keuangan"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Transaksi</h1>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{transaksi.keterangan}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form action={updateTransaksi.bind(null, id)} className="space-y-5">
          {/* Jenis */}
          <div className="space-y-1.5">
            <label htmlFor="jenis" className="text-[12px] font-bold text-slate-600">
              Jenis Transaksi <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis"
              name="jenis"
              required
              defaultValue={transaksi.jenis}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="MASUK">Pemasukan</option>
              <option value="KELUAR">Pengeluaran</option>
            </select>
          </div>

          {/* Keterangan */}
          <div className="space-y-1.5">
            <label htmlFor="keterangan" className="text-[12px] font-bold text-slate-600">
              Keterangan <span className="text-red-500">*</span>
            </label>
            <input
              id="keterangan"
              name="keterangan"
              type="text"
              required
              defaultValue={transaksi.keterangan}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Jumlah */}
          <div className="space-y-1.5">
            <label htmlFor="jumlah" className="text-[12px] font-bold text-slate-600">
              Jumlah (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="jumlah"
              name="jumlah"
              type="number"
              required
              min="1"
              step="1000"
              defaultValue={transaksi.jumlah}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Tanggal */}
          <div className="space-y-1.5">
            <label htmlFor="tanggal" className="text-[12px] font-bold text-slate-600">
              Tanggal Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              defaultValue={tanggalValue}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label htmlFor="kategoriId" className="text-[12px] font-bold text-slate-600">
              Kategori (Opsional)
            </label>
            <select
              id="kategoriId"
              name="kategoriId"
              defaultValue={transaksi.kategoriId || ""}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.nama} ({k.jenis === "MASUK" ? "Pemasukan" : "Pengeluaran"})
                </option>
              ))}
            </select>
          </div>

          {/* Bukti Transaksi */}
          <ThumbnailUpload
            name="bukti"
            defaultUrl={transaksi.bukti}
            folder="keuangan"
            label="Bukti Transaksi / Kwitansi (Opsional)"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/keuangan"
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
