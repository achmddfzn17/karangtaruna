import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SertifikatList from "@/components/member/SertifikatList";
import { Award, Download, Share2, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Sertifikat Digital | Portal Anggota",
};

export default async function SertifikatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  // Get anggota data
  const anggota = await prisma.anggota.findUnique({
    where: { userId: session.user.id },
    select: { id: true, namaLengkap: true },
  });

  if (!anggota) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Data anggota tidak ditemukan</p>
      </div>
    );
  }

  // Get sertifikat with kegiatan data
  const sertifikatList = await prisma.sertifikat.findMany({
    where: {
      anggotaKegiatan: {
        anggotaId: anggota.id,
      },
    },
    include: {
      anggotaKegiatan: {
        include: {
          kegiatan: {
            select: {
              id: true,
              nama: true,
              jenis: true,
              tanggalMulai: true,
              thumbnail: true,
            },
          },
        },
      },
    },
    orderBy: {
      tanggalTerbit: "desc",
    },
  });

  // Statistics
  const totalSertifikat = sertifikatList.length;
  const thisYear = new Date().getFullYear();
  const sertifikatThisYear = sertifikatList.filter(
    (s) => new Date(s.tanggalTerbit).getFullYear() === thisYear
  ).length;

  // Group by year
  const sertifikatByYear = sertifikatList.reduce((acc, cert) => {
    const year = new Date(cert.tanggalTerbit).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(cert);
    return acc;
  }, {} as Record<number, typeof sertifikatList>);

  const years = Object.keys(sertifikatByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Award className="w-7 h-7 text-blue-600" />
          Sertifikat Digital
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Koleksi sertifikat partisipasi kegiatan Anda
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2">
              Tentang Sertifikat Digital
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Sertifikat digital diterbitkan otomatis setelah Anda menyelesaikan
              kegiatan. Setiap sertifikat dilengkapi dengan QR code untuk verifikasi
              keaslian.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Share2 className="w-4 h-4" />
                <span>Share ke Sosmed</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span>Verifikasi QR Code</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Total Sertifikat
            </p>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{totalSertifikat}</p>
          <p className="text-xs text-slate-400 mt-1">Seluruh periode</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Tahun Ini
            </p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {sertifikatThisYear}
          </p>
          <p className="text-xs text-slate-400 mt-1">Sertifikat {thisYear}</p>
        </div>
      </div>

      {/* Sertifikat List */}
      {totalSertifikat > 0 ? (
        <div className="space-y-6">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {year}
                </span>
                <span>{year}</span>
                <span className="text-sm text-slate-400 font-normal">
                  ({sertifikatByYear[year].length} sertifikat)
                </span>
              </h2>
              <SertifikatList sertifikatList={sertifikatByYear[year]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Belum ada sertifikat tersedia
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Sertifikat akan otomatis diterbitkan setelah Anda menyelesaikan kegiatan
          </p>
        </div>
      )}
    </div>
  );
}
