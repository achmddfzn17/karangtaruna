import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Image as ImageIcon, Plus, Video } from "lucide-react";
import Link from "next/link";
import DeleteGaleriButton from "@/components/admin/DeleteGaleriButton";

export const metadata = { title: "Kelola Galeri" };

export default async function KelolaGaleriPage() {
  const galeriList = await prisma.galeriItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { kegiatan: { select: { nama: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Galeri</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dokumentasi foto dan video</p>
        </div>
        <Link
          href="/dashboard/galeri/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumentasi
        </Link>
      </div>

      {galeriList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada dokumentasi</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Mulai unggah foto atau video kegiatan Karang Taruna untuk ditampilkan di website publik.
          </p>
          <Link href="/dashboard/galeri/tambah" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
            <Plus className="w-4 h-4" /> Unggah Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galeriList.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-sm">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {item.type === "FOTO" ? (
                  <img
                    src={item.url}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                    <Video className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">VIDEO</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                  {item.type}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{item.judul}</h3>
                {item.kegiatan && (
                  <p className="text-[11px] text-blue-600 font-semibold line-clamp-1 mb-2">
                    {item.kegiatan.nama}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-slate-500 font-medium">{formatDate(item.createdAt)}</span>
                  <DeleteGaleriButton id={item.id} judul={item.judul} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
