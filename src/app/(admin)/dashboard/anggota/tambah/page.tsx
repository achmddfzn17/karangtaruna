"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import { createAnggota } from "./actions";
import { toast } from "sonner";

export default function TambahAnggotaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createAnggota(formData);
      toast.success("Berhasil menambahkan anggota baru!");
      // Redirect happens in the server action
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/anggota"
          className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Anggota</h1>
          <p className="text-sm text-slate-400 mt-1">Daftarkan anggota Karang Taruna baru</p>
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
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label htmlFor="namaLengkap" className="text-sm font-bold text-slate-700">Nama Lengkap *</label>
              <input
                id="namaLengkap"
                type="text"
                name="namaLengkap"
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* NIK */}
            <div className="space-y-2">
              <label htmlFor="nik" className="text-sm font-bold text-slate-700">NIK *</label>
              <input
                id="nik"
                type="text"
                name="nik"
                required
                maxLength={16}
                placeholder="Masukkan 16 digit NIK"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Tempat Lahir */}
            <div className="space-y-2">
              <label htmlFor="tempatLahir" className="text-sm font-bold text-slate-700">Tempat Lahir</label>
              <input
                id="tempatLahir"
                type="text"
                name="tempatLahir"
                placeholder="Contoh: Jakarta"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-2">
              <label htmlFor="tanggalLahir" className="text-sm font-bold text-slate-700">Tanggal Lahir</label>
              <input
                id="tanggalLahir"
                type="date"
                name="tanggalLahir"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
              <label htmlFor="jenisKelamin" className="text-sm font-bold text-slate-700">Jenis Kelamin *</label>
              <select
                id="jenisKelamin"
                name="jenisKelamin"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-700">Status Anggota *</label>
              <select
                id="status"
                name="status"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="AKTIF">Aktif</option>
                <option value="NON_AKTIF">Non-Aktif</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>

            {/* No HP */}
            <div className="space-y-2">
              <label htmlFor="noHp" className="text-sm font-bold text-slate-700">No. Handphone</label>
              <input
                id="noHp"
                type="tel"
                name="noHp"
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Contoh: nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Pekerjaan */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="pekerjaan" className="text-sm font-bold text-slate-700">Pekerjaan</label>
              <input
                id="pekerjaan"
                type="text"
                name="pekerjaan"
                placeholder="Contoh: Mahasiswa, Wirausaha, dll"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="alamat" className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
              <textarea
                id="alamat"
                name="alamat"
                rows={3}
                placeholder="Masukkan alamat lengkap"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <Link
              href="/dashboard/anggota"
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
              {isSubmitting ? "Menyimpan..." : "Simpan Anggota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
