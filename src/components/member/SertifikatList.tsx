"use client";

import { useState } from "react";
import { Download, Share2, QrCode, Calendar, Award, X, ExternalLink, Check, Copy, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Sertifikat {
  id: string;
  nomorSertifikat: string;
  namaAnggota: string;
  namaKegiatan: string;
  tanggalKegiatan: Date;
  tanggalTerbit: Date;
  qrCode: string | null;
  pdfUrl: string | null;
  anggotaKegiatan: {
    kegiatan: {
      id: string;
      nama: string;
      jenis: string;
      tanggalMulai: Date;
      thumbnail: string | null;
    };
  };
}

interface SertifikatListProps {
  sertifikatList: Sertifikat[];
}

const jenisColor: Record<string, string> = {
  SOSIAL: "bg-blue-100 text-blue-700",
  PENDIDIKAN: "bg-purple-100 text-purple-700",
  EKONOMI: "bg-green-100 text-green-700",
  OLAHRAGA: "bg-orange-100 text-orange-700",
  SENI_BUDAYA: "bg-pink-100 text-pink-700",
  LAINNYA: "bg-slate-100 text-slate-700",
};

export default function SertifikatList({ sertifikatList }: SertifikatListProps) {
  const [selectedCert, setSelectedCert] = useState<Sertifikat | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [shareMenuCert, setShareMenuCert] = useState<string | null>(null);

  // ── Download PDF using jsPDF ──────────────────────────────────────────────
  const handleDownload = async (cert: Sertifikat) => {
    setDownloading(cert.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(37, 99, 235); // blue-600
      doc.rect(0, 0, W, 18, "F");

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("KARANG TARUNA GENERASI EMAS", W / 2, 8, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("RW 10 Mangga Dua Selatan", W / 2, 13, { align: "center" });

      // Title
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SERTIFIKAT PARTISIPASI", W / 2, 32, { align: "center" });

      // Divider
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(20, 36, W - 20, 36);

      // Body
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Diberikan kepada", W / 2, 44, { align: "center" });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text(cert.namaAnggota, W / 2, 53, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Telah mengikuti dan menyelesaikan kegiatan", W / 2, 61, { align: "center" });

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      const kegiatanLines = doc.splitTextToSize(cert.namaKegiatan, W - 40);
      doc.text(kegiatanLines, W / 2, 69, { align: "center" });

      const afterKegiatan = 69 + kegiatanLines.length * 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(
        format(new Date(cert.tanggalKegiatan), "d MMMM yyyy", { locale: localeId }),
        W / 2,
        afterKegiatan + 6,
        { align: "center" }
      );

      // QR code
      if (cert.qrCode) {
        try {
          const qrImg = await loadImageAsBase64(cert.qrCode);
          doc.addImage(qrImg, "PNG", W - 38, H - 38, 24, 24);
        } catch {
          // skip QR if load fails
        }
      }

      // Footer
      doc.setFillColor(248, 250, 252);
      doc.rect(0, H - 14, W, 14, "F");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`No. Sertifikat: ${cert.nomorSertifikat}`, 10, H - 7);
      doc.text(
        `Diterbitkan: ${format(new Date(cert.tanggalTerbit), "d MMM yyyy", { locale: localeId })}`,
        W / 2,
        H - 7,
        { align: "center" }
      );
      doc.text("Verifikasi: /verify/" + cert.nomorSertifikat, W - 10, H - 7, { align: "right" });

      doc.save(`Sertifikat-${cert.nomorSertifikat}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(null);
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async (cert: Sertifikat) => {
    const verifyUrl = `${window.location.origin}/verify/${cert.nomorSertifikat}`;
    const text = `Saya telah menyelesaikan kegiatan "${cert.namaKegiatan}" dan mendapatkan Sertifikat Digital dari Karang Taruna Generasi Emas!\n\nVerifikasi: ${verifyUrl}`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: `Sertifikat ${cert.namaKegiatan}`, text, url: verifyUrl });
        return;
      } catch {
        // user cancelled or not supported — fall through
      }
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    } catch {
      // Last resort: show share menu
      setShareMenuCert(cert.id);
    }
  };

  const handleShareLinkedIn = (cert: Sertifikat) => {
    const url = encodeURIComponent(`${window.location.origin}/verify/${cert.nomorSertifikat}`);
    const title = encodeURIComponent(`Sertifikat ${cert.namaKegiatan}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, "_blank");
    setShareMenuCert(null);
  };

  const handleShareWhatsApp = (cert: Sertifikat) => {
    const text = encodeURIComponent(
      `Saya mendapat sertifikat kegiatan "${cert.namaKegiatan}" dari Karang Taruna!\nVerifikasi: ${window.location.origin}/verify/${cert.nomorSertifikat}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareMenuCert(null);
  };

  const handleCopyLink = async (cert: Sertifikat) => {
    await navigator.clipboard.writeText(`${window.location.origin}/verify/${cert.nomorSertifikat}`);
    setShareMenuCert(null);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <>
      {/* Copied toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-green-400" />
          Link berhasil disalin!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sertifikatList.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
              {cert.anggotaKegiatan.kegiatan.thumbnail ? (
                <img
                  src={cert.anggotaKegiatan.kegiatan.thumbnail}
                  alt={cert.namaKegiatan}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="w-16 h-16 text-white/30" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${jenisColor[cert.anggotaKegiatan.kegiatan.jenis] || jenisColor.LAINNYA}`}>
                  {cert.anggotaKegiatan.kegiatan.jenis.replace("_", " ")}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {cert.namaKegiatan}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <Calendar className="w-3 h-3" />
                {format(new Date(cert.tanggalKegiatan), "d MMMM yyyy", { locale: localeId })}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Nomor Sertifikat</p>
                <p className="text-xs font-mono font-bold text-slate-700">{cert.nomorSertifikat}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold"
                >
                  <Award className="w-3 h-3" />
                  Lihat
                </button>
                <button
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === cert.id}
                  className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-xs font-semibold disabled:opacity-50"
                  title="Download PDF"
                >
                  {downloading === cert.id ? (
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                </button>
                {/* Share with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShareMenuCert(shareMenuCert === cert.id ? null : cert.id)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-xs font-semibold"
                    title="Share"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                  {shareMenuCert === cert.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-20">
                      <button onClick={() => handleShareWhatsApp(cert)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="text-base">💬</span> WhatsApp
                      </button>
                      <button onClick={() => handleShareLinkedIn(cert)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="text-base">💼</span> LinkedIn
                      </button>
                      <button onClick={() => handleCopyLink(cert)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <Copy className="w-4 h-4 text-slate-400" /> Salin Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail */}
      {selectedCert && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCert(null); }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Detail Sertifikat</h3>
              <button onClick={() => setSelectedCert(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">SERTIFIKAT</h2>
                  <p className="text-sm text-slate-600">Diberikan kepada</p>
                </div>

                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-blue-600 text-center mb-3">{selectedCert.namaAnggota}</h3>
                  <p className="text-sm text-slate-600 text-center mb-3">Telah mengikuti dan menyelesaikan kegiatan</p>
                  <h4 className="text-lg font-bold text-slate-900 text-center mb-3">{selectedCert.namaKegiatan}</h4>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedCert.tanggalKegiatan), "d MMMM yyyy", { locale: localeId })}
                  </div>
                </div>

                {selectedCert.qrCode && (
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-xl">
                      <img src={selectedCert.qrCode} alt="QR Code" className="w-24 h-24" />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Nomor Sertifikat</p>
                  <p className="text-sm font-mono font-bold text-slate-700">{selectedCert.nomorSertifikat}</p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Jenis Kegiatan</p>
                  <p className="font-bold text-slate-900">{selectedCert.anggotaKegiatan.kegiatan.jenis.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Tanggal Terbit</p>
                  <p className="font-bold text-slate-900">
                    {format(new Date(selectedCert.tanggalTerbit), "d MMM yyyy", { locale: localeId })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleDownload(selectedCert)}
                  disabled={downloading === selectedCert.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold disabled:opacity-60"
                >
                  {downloading === selectedCert.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloading === selectedCert.id ? "Membuat PDF..." : "Download PDF"}</span>
                </button>
                <button
                  onClick={() => handleShare(selectedCert)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-semibold"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Share options (desktop) */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => handleShareWhatsApp(selectedCert)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>💬</span> WhatsApp
                </button>
                <button onClick={() => handleShareLinkedIn(selectedCert)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <span>💼</span> LinkedIn
                </button>
                <button onClick={() => handleCopyLink(selectedCert)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Copy className="w-4 h-4" /> Salin Link
                </button>
              </div>

              <div className="text-center">
                <a
                  href={`/verify/${selectedCert.nomorSertifikat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <QrCode className="w-4 h-4" />
                  Verifikasi Keaslian Sertifikat
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper: load image URL as base64 for jsPDF
async function loadImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
