import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GaleriUploadForm from "./GaleriUploadForm";

export const metadata = { title: "Tambah Dokumentasi Galeri" };

export default async function TambahGaleriPage() {
  // Fetch kegiatan langsung dari database (server-side, tidak perlu API call)
  const kegiatanList = await prisma.kegiatan.findMany({
    select: { id: true, nama: true, status: true },
    orderBy: { tanggalMulai: "desc" },
  });

  // Sort: ONGOING → UPCOMING → SELESAI → DIBATALKAN
  const order = ["ONGOING", "UPCOMING", "SELESAI", "DIBATALKAN"];
  const sorted = kegiatanList.sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  // Auto-select kegiatan ONGOING jika ada
  const ongoingKegiatan = sorted.find((k) => k.status === "ONGOING");
  const defaultKegiatanId = ongoingKegiatan?.id ?? "";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/galeri"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Dokumentasi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Upload foto atau video kegiatan</p>
        </div>
      </div>

      <GaleriUploadForm
        kegiatanList={sorted}
        defaultKegiatanId={defaultKegiatanId}
      />
    </div>
  );
}
