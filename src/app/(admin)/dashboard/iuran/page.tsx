import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, CheckCircle2, XCircle, Plus, Search } from "lucide-react";
import Link from "next/link";
import DeleteIuranButton from "@/components/admin/DeleteIuranButton";

export const metadata = { title: "Iuran Anggota" };

// Bulan & tahun untuk filter
const bulanList = [
  { value: 1, label: "Januari" }, { value: 2, label: "Februari" },
  { value: 3, label: "Maret" }, { value: 4, label: "April" },
  { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
  { value: 7, label: "Juli" }, { value: 8, label: "Agustus" },
  { value: 9, label: "September" }, { value: 10, label: "Oktober" },
  { value: 11, label: "November" }, { value: 12, label: "Desember" },
];

export default async function IuranPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string; q?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const bulan = params.bulan ? parseInt(params.bulan) : now.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : now.getFullYear();
  const q = params.q?.trim() ?? "";

  const tahunList = Array.from({ length: now.getFullYear() - 2022 }, (_, i) => 2023 + i);

  // Semua anggota aktif
  const anggotaList = await prisma.anggota.findMany({
    where: {
      status: "AKTIF",
      ...(q ? { namaLengkap: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { namaLengkap: "asc" },
    select: { id: true, namaLengkap: true, foto: true, noHp: true },
  });

  // Iuran yang sudah dibayar bulan ini
  const iuranBulanIni = await prisma.iuranAnggota.findMany({
    where: { bulan, tahun },
    select: { anggotaId: true, id: true, jumlah: true, tanggalBayar: true, keterangan: true },
  });

  const sudahBayarIds = new Set(iuranBulanIni.map((i) => i.anggotaId));
  const totalTerkumpul = iuranBulanIni.reduce((s, i) => s + i.jumlah, 0);

  async function bayarIuran(formData: FormData) {
    "use server";
    const anggotaId = formData.get("anggotaId") as string;
    const jumlah = parseFloat(formData.get("jumlah") as string);
    const keterangan = formData.get("keterangan") as string;
    const bulanVal = parseInt(formData.get("bulan") as string);
    const tahunVal = parseInt(formData.get("tahun") as string);

    if (!anggotaId || isNaN(jumlah) || jumlah <= 0) throw new Error("Data tidak valid");

    // Cek sudah bayar
    const existing = await prisma.iuranAnggota.findFirst({
      where: { anggotaId, bulan: bulanVal, tahun: tahunVal },
    });
    if (existing) throw new Error("Anggota sudah membayar iuran bulan ini");

    await prisma.iuranAnggota.create({
      data: {
        anggotaId,
        bulan: bulanVal,
        tahun: tahunVal,
        jumlah,
        keterangan: keterangan || null,
        tanggalBayar: new Date(),
      },
    });

    revalidatePath("/dashboard/iuran");
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  const sudahBayar = anggotaList.filter((a) => sudahBayarIds.has(a.id));
  const belumBayar = anggotaList.filter((a) => !sudahBayarIds.has(a.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Iuran Anggota</h1>
          <p className="text-sm text-slate-400 mt-1">Tracking pembayaran iuran bulanan anggota aktif</p>
        </div>
        <Link
          href="/dashboard/iuran/riwayat"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Wallet className="w-4 h-4" />
          Riwayat Lengkap
        </Link>
      </div>

      {/* Filter bulan/tahun */}
      <form method="GET" className="flex flex-wrap gap-3 items-end bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bulan</label>
          <select name="bulan" defaultValue={bulan} className={`${inputCls} w-auto`}>
            {bulanList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tahun</label>
          <select name="tahun" defaultValue={tahun} className={`${inputCls} w-auto`}>
            {tahunList.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[180px]">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari Anggota</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input name="q" defaultValue={q} type="text" placeholder="Nama anggota..."
              className={`${inputCls} pl-9`} />
          </div>
        </div>
        <button type="submit" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
          Tampilkan
        </button>
      </form>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200 mb-1">Terkumpul</p>
          <p className="text-2xl font-extrabold">{formatCurrency(totalTerkumpul)}</p>
          <p className="text-[11px] text-blue-200 mt-1">{bulanList[bulan - 1]?.label} {tahun}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-1">Sudah Bayar</p>
          <p className="text-2xl font-extrabold text-green-600">{sudahBayar.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">dari {anggotaList.length} anggota aktif</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-1">Belum Bayar</p>
          <p className="text-2xl font-extrabold text-red-500">{belumBayar.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">anggota aktif</p>
        </div>
      </div>

      {/* Daftar Anggota */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">
            Status Iuran — {bulanList[bulan - 1]?.label} {tahun}
          </h2>
        </div>

        {anggotaList.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-medium">Tidak ada anggota aktif ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {anggotaList.map((a) => {
              const iuran = iuranBulanIni.find((i) => i.anggotaId === a.id);
              const bayar = !!iuran;
              return (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  {/* Avatar */}
                  {a.foto ? (
                    <img src={a.foto} alt={a.namaLengkap} className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {a.namaLengkap.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{a.namaLengkap}</p>
                    {bayar && iuran && (
                      <p className="text-[11px] text-slate-400">
                        {formatCurrency(iuran.jumlah)} · {formatDate(iuran.tanggalBayar)}
                        {iuran.keterangan && ` · ${iuran.keterangan}`}
                      </p>
                    )}
                  </div>

                  {/* Status + Aksi */}
                  <div className="flex items-center gap-2 shrink-0">
                    {bayar ? (
                      <>
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                        </span>
                        {iuran && <DeleteIuranButton id={iuran.id} />}
                      </>
                    ) : (
                      <form action={bayarIuran} className="flex items-center gap-2">
                        <input type="hidden" name="anggotaId" value={a.id} />
                        <input type="hidden" name="bulan" value={bulan} />
                        <input type="hidden" name="tahun" value={tahun} />
                        <input
                          name="jumlah"
                          type="number"
                          required
                          min="1"
                          step="1000"
                          defaultValue="50000"
                          placeholder="Jumlah"
                          className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Catat
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
