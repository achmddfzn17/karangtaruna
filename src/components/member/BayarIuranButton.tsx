"use client";

import { useState } from "react";
import { X, MessageCircle, Copy, Check, CreditCard, Info } from "lucide-react";

interface BayarIuranButtonProps {
  bulanNama: string;
  tahun: number;
}

export default function BayarIuranButton({ bulanNama, tahun }: BayarIuranButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const noRek = "1234-5678-9012"; // ganti dengan nomor rekening bendahara
  const namaBendahara = "Bendahara Karang Taruna";
  const nominal = "Rp 10.000"; // ganti sesuai nominal iuran

  const waMessage = encodeURIComponent(
    `Halo, saya ingin konfirmasi pembayaran iuran bulan ${bulanNama} ${tahun}.\nNama: [Nama Anda]\nBukti transfer terlampir.`
  );
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`; // ganti nomor WA bendahara

  const handleCopy = async () => {
    await navigator.clipboard.writeText(noRek.replace(/-/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all text-sm font-semibold shrink-0"
      >
        Bayar Sekarang
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Cara Pembayaran Iuran
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Period */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Periode</p>
                <p className="font-bold text-orange-900">{bulanNama} {tahun}</p>
                <p className="text-sm text-orange-700 mt-1">Nominal: <span className="font-bold">{nominal}</span></p>
              </div>

              {/* Transfer info */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer ke</p>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Bank / E-Wallet</p>
                  <p className="font-bold text-slate-900">BCA / GoPay / OVO</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Nomor Rekening</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono font-bold text-slate-900 text-lg tracking-wider">{noRek}</p>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Disalin!" : "Salin"}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Atas Nama</p>
                  <p className="font-bold text-slate-900">{namaBendahara}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Langkah Pembayaran
                </p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Transfer sesuai nominal ke rekening di atas</li>
                  <li>Simpan bukti transfer</li>
                  <li>Konfirmasi ke bendahara via WhatsApp</li>
                </ol>
              </div>

              {/* WhatsApp confirm */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Konfirmasi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
