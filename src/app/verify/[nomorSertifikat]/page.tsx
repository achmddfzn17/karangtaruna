import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Award, CheckCircle, Calendar, User, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

export const metadata = {
  title: "Verifikasi Sertifikat | Karang Taruna",
};

export default async function VerifySertifikatPage({
  params,
}: {
  params: Promise<{ nomorSertifikat: string }>;
}) {
  const { nomorSertifikat } = await params;

  const certificate = await prisma.sertifikat.findUnique({
    where: { nomorSertifikat },
    include: {
      anggotaKegiatan: {
        include: {
          kegiatan: true,
        },
      },
    },
  });

  if (!certificate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Sertifikat Tidak Ditemukan
          </h1>
          <p className="text-slate-600 mb-6">
            Nomor sertifikat <span className="font-mono font-bold">{nomorSertifikat}</span> tidak
            terdaftar dalam sistem kami.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Sertifikat Valid
          </h1>
          <p className="text-slate-600">
            Sertifikat ini terdaftar dan terverifikasi dalam sistem kami
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <Award className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-1">
              SERTIFIKAT PARTISIPASI
            </h2>
            <p className="text-blue-100 text-sm">
              Karang Taruna RW 10 Mangga Dua Selatan
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-slate-600 mb-4">Diberikan kepada</p>
              <h3 className="text-3xl font-bold text-blue-600 mb-6">
                {certificate.namaAnggota}
              </h3>
              <p className="text-slate-600 mb-4">
                Telah mengikuti dan menyelesaikan kegiatan
              </p>
              <h4 className="text-2xl font-bold text-slate-900 mb-6">
                {certificate.namaKegiatan}
              </h4>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tanggal Kegiatan</p>
                    <p className="font-bold text-slate-900">
                      {format(
                        new Date(certificate.tanggalKegiatan),
                        "d MMMM yyyy",
                        { locale: localeId }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tanggal Terbit</p>
                    <p className="font-bold text-slate-900">
                      {format(
                        new Date(certificate.tanggalTerbit),
                        "d MMMM yyyy",
                        { locale: localeId }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Number */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-xs text-slate-500 mb-2 uppercase font-semibold">
                Nomor Sertifikat
              </p>
              <p className="text-xl font-mono font-bold text-blue-600">
                {certificate.nomorSertifikat}
              </p>
            </div>
          </div>

          {/* QR Code */}
          {certificate.qrCode && (
            <div className="border-t border-slate-200 p-6 bg-slate-50 text-center">
              <img
                src={certificate.qrCode}
                alt="QR Code"
                className="w-32 h-32 mx-auto mb-3"
              />
              <p className="text-xs text-slate-500">
                Scan QR code untuk verifikasi cepat
              </p>
            </div>
          )}
        </div>

        {/* Verification Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Informasi Verifikasi
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="font-semibold text-slate-900">Sertifikat Valid</p>
                <p className="text-slate-600">
                  Sertifikat ini terdaftar dalam database resmi Karang Taruna
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="font-semibold text-slate-900">Terverifikasi</p>
                <p className="text-slate-600">
                  Penerima telah menyelesaikan kegiatan sesuai ketentuan
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="font-semibold text-slate-900">Dapat Dipertanggungjawabkan</p>
                <p className="text-slate-600">
                  Sertifikat ini dapat digunakan sebagai bukti partisipasi resmi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
