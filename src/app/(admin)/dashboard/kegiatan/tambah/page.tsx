"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle, Loader2 } from "lucide-react";
import { createKegiatan } from "./actions";
import { toast } from "sonner";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

export default function TambahKegiatanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createKegiatan(formData);
      // Note: redirect() di server action akan throw NEXT_REDIRECT error
      // yang ditangkap oleh Next.js, jadi code ini tidak akan tereksekusi
      toast.success("Berhasil menambahkan kegiatan baru!");
    } catch (error: unknown) {
      // ✅ BUG FIX: Don't treat NEXT_REDIRECT as an error
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error; // Re-throw untuk Next.js handle redirect
      }
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      setErrorMsg(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kegiatan"
          className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
          aria-label="Kembali ke daftar kegiatan"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Kegiatan</h1>
          <p className="text-sm text-slate-400 mt-1">Buat agenda kegiatan baru</p>
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
            {/* Nama Kegiatan */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="nama" className="text-sm font-bold text-slate-700">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                type="text"
                name="nama"
                required
                minLength={5}
                maxLength={200}
                placeholder="Contoh: Rapat Rutin Bulanan"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <p className="text-xs text-slate-400">Minimal 5 karakter, maksimal 200 karakter</p>
            </div>

            {/* Jenis Kegiatan */}
            <div className="space-y-2">
              <label htmlFor="jenis" className="text-sm font-bold text-slate-700">
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis"
                name="jenis"
                required
                defaultValue="SOSIAL"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="SOSIAL">Sosial</option>
                <option value="PENDIDIKAN">Pendidikan</option>
                <option value="EKONOMI">Ekonomi</option>
                <option value="OLAHRAGA">Olahraga</option>
                <option value="SENI_BUDAYA">Seni & Budaya</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue="UPCOMING"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="UPCOMING">Akan Datang</option>
                <option value="ONGOING">Sedang Berjalan</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-2">
              <label htmlFor="tanggalMulai" className="text-sm font-bold text-slate-700">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                id="tanggalMulai"
                type="datetime-local"
                name="tanggalMulai"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Tanggal Selesai */}
            <div className="space-y-2">
              <label htmlFor="tanggalSelesai" className="text-sm font-bold text-slate-700">Tanggal Selesai</label>
              <input
                id="tanggalSelesai"
                type="datetime-local"
                name="tanggalSelesai"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <p className="text-xs text-slate-400">Harus setelah tanggal mulai</p>
            </div>

            {/* Lokasi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="lokasi" className="text-sm font-bold text-slate-700">Lokasi</label>
              <input
                id="lokasi"
                type="text"
                name="lokasi"
                maxLength={200}
                placeholder="Contoh: Balai RW 05"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Anggaran */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="anggaran" className="text-sm font-bold text-slate-700">Anggaran (Opsional)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-500 font-semibold">Rp</span>
                <input
                  id="anggaran"
                  type="number"
                  name="anggaran"
                  min="0"
                  max="999999999"
                  step="1000"
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-400">Maksimal Rp 999.999.999</p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700">Deskripsi Lengkap</label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                maxLength={5000}
                placeholder="Jelaskan detail kegiatan ini..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-400">Maksimal 5000 karakter</p>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <ThumbnailUpload
                name="thumbnail"
                folder="kegiatan"
                label="Thumbnail Kegiatan (Opsional)"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link
              href="/dashboard/kegiatan"
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Kegiatan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
