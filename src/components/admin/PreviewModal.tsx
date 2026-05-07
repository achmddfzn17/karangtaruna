"use client";

import { X, Calendar, Eye, Tag } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "berita" | "artikel";
  data: {
    judul: string;
    kategori: string;
    ringkasan: string;
    isi: string;
  };
}

export default function PreviewModal({ isOpen, onClose, type, data }: PreviewModalProps) {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-700">
              Preview {type === "berita" ? "Berita" : "Artikel"}
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase">
              Draft
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Kategori */}
          {data.kategori && (
            <div className="flex items-center gap-1.5 mb-4">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[12px] font-bold text-blue-600 uppercase tracking-wide">
                {data.kategori}
              </span>
            </div>
          )}

          {/* Judul */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            {data.judul || <span className="text-slate-300 italic">Judul belum diisi</span>}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-slate-400 font-medium mb-6 pb-6 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {today}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              0 views
            </span>
          </div>

          {/* Ringkasan */}
          {data.ringkasan && (
            <div className="bg-blue-50 border-l-4 border-blue-500 px-5 py-4 rounded-r-xl mb-6">
              <p className="text-[14px] text-slate-700 leading-relaxed italic">{data.ringkasan}</p>
            </div>
          )}

          {/* Isi */}
          <div className="prose prose-slate max-w-none text-[15px] leading-relaxed">
            {data.isi ? (
              <div
                className="text-slate-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: data.isi.replace(/\n/g, "<br/>") }}
              />
            ) : (
              <p className="text-slate-300 italic">Isi konten belum diisi</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Ini adalah tampilan preview — konten belum dipublikasikan
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
}
