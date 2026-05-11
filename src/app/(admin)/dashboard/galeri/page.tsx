import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { 
  Image as ImageIcon, Plus, Video, Search, Filter, 
  Settings, Calendar, Camera, Film
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteGaleriButton from "@/components/admin/DeleteGaleriButton";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Kelola Galeri" };

type GaleriWithKegiatan = Prisma.GaleriItemGetPayload<{
  include: { kegiatan: { select: { nama: true } } };
}>;

const VALID_TYPES = ["FOTO", "VIDEO"] as const;
type GaleriType = typeof VALID_TYPES[number];

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function KelolaGaleriPage({ searchParams }: PageProps) {
  // ✅ Auth check
  await requireAdmin();

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  
  const typeParam = params.type;
  const typeFilter: GaleriType | "SEMUA" = 
    typeParam && VALID_TYPES.includes(typeParam as GaleriType)
      ? (typeParam as GaleriType)
      : "SEMUA";

  // Build where condition
  const whereConditions: Prisma.GaleriItemWhereInput[] = [];
  if (q) {
    whereConditions.push({
      OR: [
        { judul: { contains: q, mode: "insensitive" } },
        { kegiatan: { nama: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (typeFilter !== "SEMUA") {
    whereConditions.push({ type: typeFilter });
  }

  const where: Prisma.GaleriItemWhereInput = 
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Parallel queries
  const [galeriList, totalFiltered, totalFoto, totalVideo] = await Promise.all([
    prisma.galeriItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { kegiatan: { select: { nama: true } } },
    }),
    prisma.galeriItem.count({ where }),
    prisma.galeriItem.count({ where: { type: "FOTO" } }),
    prisma.galeriItem.count({ where: { type: "VIDEO" } }),
  ]);

  const totalAll = totalFoto + totalVideo;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <ImageIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manajemen Data Galeri
              </h1>
              <p className="text-sm text-slate-600 font-medium mt-1">
                Kelola dokumentasi foto dan video kegiatan Karang Taruna
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
          <p className="text-xs text-slate-500 mt-1">Akses cepat untuk mengelola data galeri</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/galeri/tambah"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              aria-label="Tambah Dokumentasi Baru"
            >
              <Plus className="w-4 h-4" />
              Tambah Dokumentasi
            </Link>

            <form method="GET" className="flex gap-2">
              <input type="hidden" name="type" value={typeFilter} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={q}
                  type="text"
                  placeholder="Cari judul atau nama kegiatan..."
                  className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
                  aria-label="Cari galeri"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
              {q && (
                <Link
                  href={`/dashboard/galeri?type=${typeFilter}`}
                  className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Reset
                </Link>
              )}
            </form>

            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-slate-500" />
              <Link
                href={`/dashboard/galeri?type=SEMUA${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  typeFilter === "SEMUA" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Semua ({totalAll})
              </Link>
              <Link
                href={`/dashboard/galeri?type=FOTO${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  typeFilter === "FOTO" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Foto ({totalFoto})
              </Link>
              <Link
                href={`/dashboard/galeri?type=VIDEO${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  typeFilter === "VIDEO" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Video ({totalVideo})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500 rounded-xl">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalAll}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Dokumentasi</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-5 border border-cyan-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-cyan-500 rounded-xl">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">Foto</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalFoto}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Foto</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border border-green-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-500 rounded-xl">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Video</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalVideo}</p>
          <p className="text-xs text-slate-600 font-medium mt-1">Total Video</p>
        </div>
      </div>

      {/* Galeri Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Galeri Dokumentasi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {totalFiltered} dokumentasi
              {(q || typeFilter !== "SEMUA") && " (difilter)"}
            </p>
          </div>
        </div>

        {galeriList.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
              <ImageIcon className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">Belum Ada Dokumentasi</p>
            <p className="text-sm text-slate-500 mb-6">
              {q || typeFilter !== "SEMUA"
                ? "Tidak ada dokumentasi yang sesuai filter"
                : "Mulai unggah foto atau video kegiatan"}
            </p>
            {!q && typeFilter === "SEMUA" && (
              <Link
                href="/dashboard/galeri/tambah"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Unggah Sekarang
              </Link>
            )}
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galeriList.map((item: GaleriWithKegiatan) => (
              <div
                key={item.id}
                className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {item.type === "FOTO" ? (
                    <Image
                      src={item.url}
                      alt={item.judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                      <Video className="w-10 h-10 mb-2 text-blue-400" />
                      <span className="text-[10px] font-bold tracking-wider bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-400/20">
                        VIDEO
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold rounded-lg shadow-sm">
                    {item.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.judul}
                    </h3>
                    {item.kegiatan && (
                      <p className="text-xs text-blue-600 font-medium line-clamp-1 mt-1">
                        {item.kegiatan.nama}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    <DeleteGaleriButton id={item.id} judul={item.judul} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Konfigurasi Data Galeri */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Konfigurasi Data Galeri</h2>
            <p className="text-xs text-slate-600 mt-0.5">Pengaturan dan informasi sistem data galeri</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Dokumentasi</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalAll} Item</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Foto</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalFoto} Foto</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs font-bold text-slate-700">Total Video</p>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{totalVideo} Video</p>
          </div>
        </div>
      </div>
    </div>
  );
}
