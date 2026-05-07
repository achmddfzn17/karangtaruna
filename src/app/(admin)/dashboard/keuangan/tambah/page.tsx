import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

export const metadata = { title: "Tambah Transaksi Keuangan" };

export default async function TambahTransaksiPage() {
  const kategoriList = await prisma.kategoriTransaksi.findMany({
    orderBy: { nama: "asc" },
  });

  async function createTransaksi(formData: FormData) {
    "use server";
    const keterangan = formData.get("keterangan") as string;
    const jumlah = formData.get("jumlah") as string;
    const jenis = formData.get("jenis") as "MASUK" | "KELUAR";
    const tanggal = formData.get("tanggal") as string;
    const kategoriId = formData.get("kategoriId") as string;
    const bukti = formData.get("bukti") as string;

    if (!keterangan || !jumlah || !jenis || !tanggal) {
      throw new Error("Semua field wajib diisi");
    }

    const jumlahNum = parseFloat(jumlah);
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      throw new Error("Jumlah harus berupa angka positif");
    }

    await prisma.transaksiKeuangan.create({
      data: {
        keterangan,
        jumlah: jumlahNum,
        jenis,
        tanggal: new Date(tanggal),
        kategoriId: kategoriId || null,
        bukti: bukti || null,
      },
    });

    revalidatePath("/dashboard/keuangan");
    redirect("/dashboard/keuangan");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/keuangan" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Transaksi</h1>
          <p className="text-sm text-slate-400 mt-0.5">Catat pemasukan atau pengeluaran kas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form action={createTransaksi} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Jenis Transaksi <span className="text-red-500">*</span></label>
            <select name="jenis" required className={inputCls}>
              <option value="MASUK">Pemasukan</option>
              <option value="KELUAR">Pengeluaran</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Keterangan <span className="text-red-500">*</span></label>
            <input name="keterangan" type="text" required placeholder="Contoh: Iuran anggota bulan Januari" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Jumlah (Rp) <span className="text-red-500">*</span></label>
            <input name="jumlah" type="number" required min="1" step="1000" placeholder="Contoh: 500000" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Tanggal Transaksi <span className="text-red-500">*</span></label>
            <input name="tanggal" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Kategori (Opsional)</label>
            <select name="kategoriId" className={inputCls}>
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
            folder="keuangan"
            label="Bukti Transaksi / Kwitansi (Opsional)"
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link href="/dashboard/keuangan" className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Batal
            </Link>
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
              <PlusCircle className="w-4 h-4" />
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
