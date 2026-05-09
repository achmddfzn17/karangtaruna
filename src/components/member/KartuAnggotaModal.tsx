"use client";

import { useState } from "react";
import { QrCode, X, Calendar, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface KartuAnggotaModalProps {
  namaLengkap: string;
  nik: string;
  status: string;
  tanggalGabung: string;
  foto: string | null;
}

export default function KartuAnggotaModal({
  namaLengkap,
  nik,
  status,
  tanggalGabung,
  foto,
}: KartuAnggotaModalProps) {
  const [open, setOpen] = useState(false);

  const qrData = encodeURIComponent(`KARANG-TARUNA|${nik}|${namaLengkap}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  const avatarUrl =
    foto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(namaLengkap)}&background=2563eb&color=fff&size=200`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl p-4 flex items-center gap-4 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-purple-900">Kartu Anggota Digital</h4>
          <p className="text-[11px] text-purple-700">Lihat QR Code & Info Keanggotaan</p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Kartu Anggota Digital</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Card */}
            <div className="p-5">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white relative overflow-hidden">
                {/* Decorations */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Org header */}
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                      Karang Taruna
                    </p>
                    <p className="text-[10px] text-blue-200">Generasi Emas</p>
                  </div>
                </div>

                {/* Avatar + Info */}
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <img
                    src={avatarUrl}
                    alt={namaLengkap}
                    className="w-16 h-16 rounded-xl border-2 border-white/30 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-extrabold text-base leading-tight truncate">
                      {namaLengkap}
                    </p>
                    <p className="text-blue-200 text-xs mt-0.5">NIK: {nik || "—"}</p>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        status === "AKTIF"
                          ? "bg-green-400/20 text-green-200"
                          : "bg-slate-400/20 text-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === "AKTIF" ? "bg-green-400" : "bg-slate-400"
                        }`}
                      />
                      {status}
                    </span>
                  </div>
                </div>

                {/* QR + Date */}
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-[10px] text-blue-300 mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Bergabung
                    </p>
                    <p className="text-xs font-bold">
                      {tanggalGabung
                        ? format(new Date(tanggalGabung), "d MMM yyyy", {
                            locale: localeId,
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg">
                    <img src={qrUrl} alt="QR Code" className="w-14 h-14" />
                  </div>
                </div>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-3">
                Tunjukkan kartu ini saat menghadiri kegiatan
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
