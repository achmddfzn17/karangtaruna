import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Wallet, CheckCircle2, Plus, Search, Settings, Filter,
  Users, Clock, TrendingUp, XCircle
} from "lucide-react";
import Image from "next/image";
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

interface PageProps {
  searchParams: Promise<{ bulan?: string; tahun?: string; q?: string; status?: string }>;
}

export default async function IuranPage({ searchParams }: PageProps) {
  // ✅ Auth check
  await requireAdmin();

  const params = await searchParams;
  const now = new Date();
  
  // ✅ Validate bulan input
  const bulanParam = params.bulan ? parseInt(params.bulan) : now.getMonth() + 1;
  const bulan = bulanParam >= 1 && bulanParam <= 12 ? bulanParam : now.getMonth() + 1;
  
  // ✅ Validate tahun input
  const tahunParam = params.tahun ? parseInt(params.tahun) : now.getFullYear();
  const tahun = tahunParam >= 2020 && tahunParam <= 2100 ? tahunParam : now.getFullYear();
  
  const q = params.q?.trim() ?? "";
  const statusFilter = params.status ?? "SEMUA"; // SEMUA, LUNAS, BELUM

  const tahunList = Array.from({ length: Math.max(3, now.getFullYear() - 2022) }, (_, i) => 2023 + i);

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

  const sudahBayar = anggotaList.filter((a) => sudahBayarIds.has(a.id));
  const belumBayar = anggotaList.filter((a) => !sudahBayarIds.has(a.id));
  
  // Filter based on status
  let filteredList = anggotaList;
  if (statusFilter === "LUNAS") {
    filteredList = sudahBayar;
  } else if (statusFilter === "BELUM") {
    filteredList = belumBayar;
  }

  // Calculate percentage
  const totalAnggota = anggotaList.length;
  const persentaseBayar = totalAnggota > 0 ? Math.round((sudahBayar.length / totalAnggota) * 100) : 0;

  async function bayarIuran(formData: FormData) {
    "use server";
    
    // ✅ Auth check in server action
    await requireAdmin();

    const anggotaId = formData.get("anggotaId") as string;
    const jumlah = parseFloat(formData.get("jumlah") as string);
    const keterangan = formData.get("keterangan") as string;
    const bulanVal = parseInt(formData.get("bulan") as string);
    const tahunVal = parseInt(formData.get("tahun") as string);

    // ✅ Enhanced validation
    if (!anggotaId) throw new Error("Anggota harus dipilih");
    if (isNaN(jumlah) || jumlah <= 0) throw new Error("Jumlah harus lebih dari 0");
    if (jumlah > 999_999_999) throw new Error("Jumlah terlalu besar");
    if (isNaN(bulanVal) || bulanVal < 1 || bulanVal > 12) throw new Error("Bulan tidak valid");
    if (isNaN(tahunVal) || tahunVal < 2020 || tahunVal > 2100) throw new Error("Tahun tidak valid");

    // ✅ Use transaction to prevent race condition
    try {
      await prisma.$transaction(async (tx) => {
        // Cek sudah bayar
        const existing = await tx.iuranAnggota.findFirst({
          where: { anggotaId, bulan: bulanVal, tahun: tahunVal },
        });
        if (existing) throw new Error("Anggota sudah membayar iuran bulan ini");

        await tx.iuranAnggota.create({
          data: {
            anggotaId,
            bulan: bulanVal,
            tahun: tahunVal,
            jumlah,
            keterangan: keterangan || null,
            tanggalBayar: new Date(),
          },
        });
      });
    } catch (error) {
      console.error("[BAYAR_IURAN_ERROR]", error);
      if (error instanceof Error) throw error;
      throw new Error("Gagal mencatat pembayaran iuran");
    }

    revalidatePath("/dashboard/iuran");
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Iuran
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Tracking pembayaran iuran bulanan anggota Karang Taruna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Pengelolaan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Tombol Pengelolaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Filter periode dan cari anggota</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Filter Form */}
            <form method="GET" className="flex gap-2 flex-wrap items-end">
              <input type="hidden" name="status" value={statusFilter} />
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Bulan</label>
                <select 
                  name="bulan" 
                  defaultValue={bulan} 
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  aria-label="Pilih bulan"
                >
                  {bulanList.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tahun</label>
                <select 
                  name="tahun" 
                  defaultValue={tahun} 
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  aria-label="Pilih tahun"
                >
                  {tahunList.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cari Anggota</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="q" 
                    defaultValue={q} 
                    type="text" 
                    placeholder="Nama anggota..."
                    className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-56"
                    aria-label="Cari anggota"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Tampilkan
              </button>

              {(q || statusFilter !== "SEMUA") && (
                <Link
                  href={`/dashboard/iuran?bulan=${bulan}&tahun=${tahun}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 items-center ml-auto">
              <Link
                href={`/dashboard/iuran?bulan=${bulan}&tahun=${tahun}&status=SEMUA${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "SEMUA" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua ({totalAnggota})
              </Link>
              <Link
                href={`/dashboard/iuran?bulan=${bulan}&tahun=${tahun}&status=LUNAS${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "LUNAS" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Lunas ({sudahBayar.length})
              </Link>
              <Link
                href={`/dashboard/iuran?bulan=${bulan}&tahun=${tahun}&status=BELUM${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === "BELUM" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Belum ({belumBayar.length})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {bulanList[bulan - 1]?.label}
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 truncate">{formatCurrency(totalTerkumpul)}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Terkumpul</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Lunas</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{sudahBayar.length}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Sudah Bayar</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-5 border border-red-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-500 rounded-xl">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{belumBayar.length}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Belum Bayar</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Rate</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{persentaseBayar}%</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Tingkat Bayar</p>
        </div>
      </div>

      {/* Tabel Data Iuran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Status Iuran — {bulanList[bulan - 1]?.label} {tahun}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {filteredList.length} anggota
              {(q || statusFilter !== "SEMUA") && " (difilter)"}
            </p>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <Users className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Tidak Ada Data</p>
            <p className="text-sm text-slate-500">
              {q || statusFilter !== "SEMUA"
                ? "Tidak ada anggota yang sesuai filter"
                : "Belum ada anggota aktif untuk periode ini"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((a) => {
              const iuran = iuranBulanIni.find((i) => i.anggotaId === a.id);
              const bayar = !!iuran;
              return (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/40 transition-colors">
                  {/* Avatar */}
                  {a.foto ? (
                    <div className="relative w-11 h-11 shrink-0">
                      <Image 
                        src={a.foto} 
                        alt={a.namaLengkap} 
                        fill 
                        className="rounded-full object-cover border-2 border-slate-200" 
                        sizes="44px" 
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base shrink-0 border-2 border-blue-200">
                      {a.namaLengkap.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{a.namaLengkap}</p>
                    {bayar && iuran ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-green-600">{formatCurrency(iuran.jumlah)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(iuran.tanggalBayar)}
                        </span>
                        {iuran.keterangan && (
                          <>
                            <span>•</span>
                            <span className="line-clamp-1">{iuran.keterangan}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      a.noHp && (
                        <p className="text-xs text-slate-500 mt-0.5">{a.noHp}</p>
                      )
                    )}
                  </div>

                  {/* Status + Aksi */}
                  <div className="flex items-center gap-2 shrink-0">
                    {bayar ? (
                      <>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                        </span>
                        {iuran && <DeleteIuranButton id={iuran.id} data={iuran} />}
                      </>
                    ) : (
                      <form action={bayarIuran} className="flex items-center gap-2">
                        <input type="hidden" name="anggotaId" value={a.id} />
                        <input type="hidden" name="bulan" value={bulan} />
                        <input type="hidden" name="tahun" value={tahun} />
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">Rp</span>
                          <input
                            name="jumlah"
                            type="number"
                            required
                            min="1000"
                            max="999999999"
                            step="1000"
                            defaultValue="50000"
                            placeholder="Jumlah"
                            aria-label="Jumlah iuran"
                            className="w-32 pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                          />
                        </div>
                        <button
                          type="submit"
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                          aria-label={`Catat pembayaran iuran ${a.namaLengkap}`}
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

      {/* Konfigurasi Data Iuran */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Iuran</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data iuran</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Anggota Aktif</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAnggota} Anggota</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Periode Aktif</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{bulanList[bulan - 1]?.label} {tahun}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Tingkat Pembayaran</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{persentaseBayar}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
