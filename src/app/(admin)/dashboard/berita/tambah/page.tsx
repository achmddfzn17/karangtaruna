"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import { createBerita } from "../actions";
import { toast } from "sonner";

export default function TambahBeritaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createBerita(formData);
      toast.success("Berhasil mempublikasikan berita!");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/berita"
          className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Berita</h1>
          <p className="text-sm text-slate-400 mt-1">Publikasi berita Karang Taruna terbaru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="judul" className="text-sm font-bold text-slate-700">Judul Berita *</label>
              <input
                id="judul"
                type="text"
                name="judul"
                required
                placeholder="Masukkan judul berita"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="kategori" className="text-sm font-bold text-slate-700">Kategori</label>
              <input
                id="kategori"
                type="text"
                name="kategori"
                placeholder="Contoh: Pengumuman, Sosial, dll"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-700">Status *</label>
              <select
                id="status"
                name="status"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="ringkasan" className="text-sm font-bold text-slate-700">Ringkasan (Opsional)</label>
              <textarea
                id="ringkasan"
                name="ringkasan"
                rows={2}
                placeholder="Tulis ringkasan singkat berita ini..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="isi" className="text-sm font-bold text-slate-700">Isi Berita *</label>
              <textarea
                id="isi"
                name="isi"
                required
                rows={8}
                placeholder="Tulis isi berita selengkapnya..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link
              href="/dashboard/berita"
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Berita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
