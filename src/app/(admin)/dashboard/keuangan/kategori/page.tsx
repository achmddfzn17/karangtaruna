import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react";
import DeleteKategoriButton from "@/components/admin/DeleteKategoriButton";

export const metadata = { title: "Kategori Keuangan" };

export default async function KategoriKeuanganPage() {
  const kategoriList = await prisma.kategoriTransaksi.findMany({
    orderBy: [{ jenis: "asc" }, { nama: "asc" }],
    include: { _count: { select: { transaksi: true } } },
  });

  async function createKategori(formData: FormData) {
    "use server";
    const nama = (formData.get("nama") as string)?.trim();
    const jenis = formData.get("jenis") as "MASUK" | "KELUAR";
    const keterangan = (formData.get("keterangan") as string)?.trim();

    if (!nama || !jenis) throw new Error("Nama dan jenis wajib diisi");

    await prisma.kategoriTransaksi.create({
      data: { nama, jenis, keterangan: keterangan || null },
    });

    revalidatePath("/dashboard/keuangan/kategori");
    revalidatePath("/dashboard/keuangan");
    redirect("/dashboard/keuangan/kategori");
  }

  const masuk = kategoriList.filter((k) => k.jenis === "MASUK");
  const keluar = kategoriList.filter((k) => k.jenis === "KELUAR");

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/keuangan"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kategori Keuangan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Tambah Kategori
            </h2>
            <form action={createKategori} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  type="text"
                  required
                  placeholder="Contoh: Iuran Anggota"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Jenis <span className="text-red-500">*</span>
                </label>
                <select name="jenis" required className={inputCls}>
                  <option value="MASUK">Pemasukan</option>
                  <option value="KELUAR">Pengeluaran</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600">
                  Keterangan (Opsional)
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  placeholder="Deskripsi singkat kategori..."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Kategori
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Kategori */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pemasukan */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-800">
                Kategori Pemasukan ({masuk.length})
              </h2>
            </div>
            {masuk.length === 0 ? (
              <div className="py-10 text-center">
                <Tag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Belum ada kategori pemasukan</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {masuk.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                      {k.keterangan && (
                        <p className="text-xs text-slate-400 mt-0.5">{k.keterangan}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {k._count.transaksi} transaksi
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/keuangan/kategori/edit/${k.id}`}
                        className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteKategoriButton
                        id={k.id}
                        nama={k.nama}
                        jumlahTransaksi={k._count.transaksi}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pengeluaran */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h2 className="text-sm font-bold text-slate-800">
                Kategori Pengeluaran ({keluar.length})
              </h2>
            </div>
            {keluar.length === 0 ? (
              <div className="py-10 text-center">
                <Tag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Belum ada kategori pengeluaran</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {keluar.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{k.nama}</p>
                      {k.keterangan && (
                        <p className="text-xs text-slate-400 mt-0.5">{k.keterangan}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {k._count.transaksi} transaksi
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/keuangan/kategori/edit/${k.id}`}
                        className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteKategoriButton
                        id={k.id}
                        nama={k.nama}
                        jumlahTransaksi={k._count.transaksi}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
