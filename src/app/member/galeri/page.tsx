import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import GaleriGrid from "@/components/member/GaleriGrid";
import { Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Galeri Kegiatan | Portal Anggota",
};

export default async function GaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ kegiatan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  const params = await searchParams;

  // Get anggota data
  const anggota = await prisma.anggota.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!anggota) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Data anggota tidak ditemukan</p>
      </div>
    );
  }

  // Get kegiatan yang diikuti
  const kegiatanDiikuti = await prisma.anggotaKegiatan.findMany({
    where: { anggotaId: anggota.id },
    include: {
      kegiatan: {
        include: {
          galeri: true,
        },
      },
    },
    orderBy: {
      kegiatan: {
        tanggalMulai: "desc",
      },
    },
  });

  // Filter by kegiatan if specified
  const kegiatanFilter = params.kegiatan;
  const filteredKegiatan = kegiatanFilter
    ? kegiatanDiikuti.filter((k) => k.kegiatanId === kegiatanFilter)
    : kegiatanDiikuti;

  // Flatten galeri items
  const galeriItems = filteredKegiatan.flatMap((k) =>
    k.kegiatan.galeri.map((g) => ({
      ...g,
      kegiatanNama: k.kegiatan.nama,
      kegiatanId: k.kegiatan.id,
    }))
  );

  // Get unique kegiatan for filter
  const uniqueKegiatan = kegiatanDiikuti.map((k) => ({
    id: k.kegiatan.id,
    nama: k.kegiatan.nama,
    galeriCount: k.kegiatan.galeri.length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-blue-600" />
          Galeri Kegiatan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dokumentasi foto dan video kegiatan yang Anda ikuti
        </p>
      </div>

      {/* Filter Kegiatan */}
      {uniqueKegiatan.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <a
            href="/member/galeri"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !kegiatanFilter
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            Semua ({galeriItems.length})
          </a>
          {uniqueKegiatan.map((kegiatan) => (
            <a
              key={kegiatan.id}
              href={`/member/galeri?kegiatan=${kegiatan.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                kegiatanFilter === kegiatan.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {kegiatan.nama} ({kegiatan.galeriCount})
            </a>
          ))}
        </div>
      )}

      {/* Galeri Grid */}
      {galeriItems.length > 0 ? (
        <GaleriGrid items={galeriItems} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {kegiatanFilter
              ? "Belum ada dokumentasi untuk kegiatan ini"
              : "Belum ada dokumentasi kegiatan"}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Dokumentasi akan muncul setelah Anda mengikuti kegiatan
          </p>
        </div>
      )}
    </div>
  );
}
