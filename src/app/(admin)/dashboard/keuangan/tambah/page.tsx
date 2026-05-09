import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";
import { KategoriTransaksi } from "@prisma/client";

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

  const labelCls = "text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1";
  const inputCls =
    "w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all appearance-none";

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-5">
        <Link 
          href="/dashboard/keuangan" 
          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-blue-200 transition-all text-slate-400 hover:text-blue-600 shadow-sm active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Catat arus kas masuk atau keluar organisasi</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
        <form action={createTransaksi} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="jenis" className={labelCls}>Jenis Transaksi <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select id="jenis" name="jenis" title="Pilih Jenis Transaksi" required className={inputCls}>
                  <option value="MASUK">Pemasukan (+)</option>
                  <option value="KELUAR">Pengeluaran (-)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-black">
                  ↓
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tanggal" className={labelCls}>Tanggal Transaksi <span className="text-rose-500">*</span></label>
              <input id="tanggal" name="tanggal" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="keterangan" className={labelCls}>Keterangan Transaksi <span className="text-rose-500">*</span></label>
            <input id="keterangan" name="keterangan" type="text" required placeholder="Contoh: Iuran anggota bulan Januari" className={inputCls} />
          </div>

          <div className="space-y-2">
            <label htmlFor="jumlah" className={labelCls}>Jumlah (Rp) <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">Rp</span>
              <input id="jumlah" name="jumlah" type="number" required min="1" step="1000" placeholder="Contoh: 500000" className={`${inputCls} pl-12`} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="kategoriId" className={labelCls}>Kategori (Opsional)</label>
            <div className="relative">
              <select id="kategoriId" name="kategoriId" title="Pilih Kategori Transaksi" className={inputCls}>
                <option value="">Tanpa Kategori</option>
                {kategoriList.map((k: KategoriTransaksi) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.jenis === "MASUK" ? "Masuk" : "Keluar"})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-black">
                ↓
              </div>
            </div>
          </div>

          {/* Bukti Transaksi */}
          <div className="pt-2">
            <ThumbnailUpload
              name="bukti"
              folder="keuangan"
              label="Bukti Transaksi / Kwitansi"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-50">
            <Link href="/dashboard/keuangan" className="px-8 py-4 rounded-2xl text-[13px] font-black text-slate-500 hover:bg-slate-50 transition-all">
              BATAL
            </Link>
            <button type="submit" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white text-[13px] font-black rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95">
              <PlusCircle className="w-4 h-4" />
              SIMPAN TRANSAKSI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
