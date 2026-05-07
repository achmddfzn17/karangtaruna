"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle, Eye } from "lucide-react";
import { createBerita } from "../actions";
import { toast } from "sonner";
import PreviewModal from "@/components/admin/PreviewModal";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";
import TagsInput from "@/components/admin/TagsInput";

export default function TambahBeritaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    try {
      await createBerita(formData);
      toast.success("Berhasil mempublikasikan berita!");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 text-sm";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/berita"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Berita</h1>
          <p className="text-sm text-slate-500 mt-1">Publikasi berita Karang Taruna terbaru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Judul */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="judul" className="text-sm font-bold text-slate-700">
                Judul Berita <span className="text-red-500">*</span>
              </label>
              <input
                id="judul"
                type="text"
                name="judul"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul berita"
                className={inputCls}
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label htmlFor="kategori" className="text-sm font-bold text-slate-700">
                Kategori
              </label>
              <input
                id="kategori"
                type="text"
                name="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Contoh: Pengumuman, Sosial, dll"
                className={inputCls}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select id="status" name="status" required className={`${inputCls} bg-white`}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <ThumbnailUpload
                name="thumbnail"
                folder="berita"
                label="Thumbnail Berita (Opsional)"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <TagsInput name="tags" placeholder="Contoh: pengumuman, sosial, kegiatan..." />
            </div>

            {/* Ringkasan */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="ringkasan" className="text-sm font-bold text-slate-700">
                Ringkasan (Opsional)
              </label>
              <textarea
                id="ringkasan"
                name="ringkasan"
                rows={2}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                placeholder="Tulis ringkasan singkat berita ini..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Isi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="isi" className="text-sm font-bold text-slate-700">
                Isi Berita <span className="text-red-500">*</span>
              </label>
              <textarea
                id="isi"
                name="isi"
                required
                rows={10}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Tulis isi berita selengkapnya..."
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!judul && !isi}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/berita"
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm text-sm"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Menyimpan..." : "Simpan Berita"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        type="berita"
        data={{ judul, kategori, ringkasan, isi }}
      />
    </div>
  );
}
