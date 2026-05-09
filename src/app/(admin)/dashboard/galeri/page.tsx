import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Image as ImageIcon, Plus, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteGaleriButton from "@/components/admin/DeleteGaleriButton";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Kelola Galeri" };

type GaleriWithKegiatan = Prisma.GaleriItemGetPayload<{
  include: { kegiatan: { select: { nama: true } } };
}>;

export default async function KelolaGaleriPage() {
  const galeriList = await prisma.galeriItem.findMany({
    orderBy: { createdAt: "desc" },
    include: { kegiatan: { select: { nama: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Galeri</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola dokumentasi foto dan video kegiatan</p>
        </div>
        <Link
          href="/dashboard/galeri/tambah"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumentasi
        </Link>
      </div>

      {galeriList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Belum ada dokumentasi</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto font-medium">
            Mulai unggah foto atau video kegiatan Karang Taruna untuk ditampilkan di galeri publik.
          </p>
          <Link href="/dashboard/galeri/tambah" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 text-[13px] font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Unggah Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galeriList.map((item: GaleriWithKegiatan) => (
            <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {item.type === "FOTO" ? (
                  <Image
                    src={item.url}
                    alt={item.judul}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                    <Video className="w-10 h-10 mb-2 text-blue-500 opacity-80" />
                    <span className="text-[10px] font-black tracking-widest bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-400/20">VIDEO</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black tracking-[0.1em] rounded-full border border-white/10 uppercase">
                  {item.type}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-[15px] font-black text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors tracking-tight">{item.judul}</h3>
                {item.kegiatan && (
                  <p className="text-[11px] text-blue-500 font-black uppercase tracking-wider line-clamp-1 mb-4">
                    {item.kegiatan.nama}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(item.createdAt)}</span>
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
