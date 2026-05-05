"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import { createKegiatan } from "./actions";
import { toast } from "sonner";

export default function TambahKegiatanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createKegiatan(formData);
      toast.success("Berhasil menambahkan kegiatan baru!");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kegiatan"
          className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
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
              <label htmlFor="nama" className="text-sm font-bold text-slate-700">Nama Kegiatan *</label>
              <input
                id="nama"
                type="text"
                name="nama"
                required
                placeholder="Contoh: Rapat Rutin Bulanan"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Jenis Kegiatan */}
            <div className="space-y-2">
              <label htmlFor="jenis" className="text-sm font-bold text-slate-700">Jenis Kegiatan *</label>
              <select
                id="jenis"
                name="jenis"
                required
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
              <label htmlFor="status" className="text-sm font-bold text-slate-700">Status *</label>
              <select
                id="status"
                name="status"
                required
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
              <label htmlFor="tanggalMulai" className="text-sm font-bold text-slate-700">Tanggal Mulai *</label>
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
            </div>

            {/* Lokasi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="lokasi" className="text-sm font-bold text-slate-700">Lokasi</label>
              <input
                id="lokasi"
                type="text"
                name="lokasi"
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
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700">Deskripsi Lengkap</label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                placeholder="Jelaskan detail kegiatan ini..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
