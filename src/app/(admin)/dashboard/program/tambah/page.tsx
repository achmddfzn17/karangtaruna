"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle } from "lucide-react";
import { createProgram } from "../actions";

export default function TambahProgramPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createProgram(formData);
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/program"
          className="p-2 bg-white rounded-xl border border-gray-100 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Program</h1>
          <p className="text-sm text-slate-400 mt-1">Tambah program kerja baru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Nama */}
          <div className="space-y-2">
            <label htmlFor="nama" className="text-sm font-bold text-slate-700">
              Nama Program <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              type="text"
              name="nama"
              required
              placeholder="Contoh: Program Pemberdayaan Pemuda"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label htmlFor="deskripsi" className="text-sm font-bold text-slate-700">
              Deskripsi (Opsional)
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={4}
              placeholder="Jelaskan tujuan dan manfaat program ini..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label htmlFor="icon" className="text-sm font-bold text-slate-700">
              Nama Icon Lucide (Opsional)
            </label>
            <input
              id="icon"
              type="text"
              name="icon"
              placeholder="Contoh: Heart, Star, Users, BookOpen"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400">
              Gunakan nama komponen dari{" "}
              <a
                href="https://lucide.dev/icons/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                lucide.dev/icons
              </a>
              , contoh: <code className="bg-slate-100 px-1 rounded">Heart</code>,{" "}
              <code className="bg-slate-100 px-1 rounded">BookOpen</code>
            </p>
          </div>

          {/* Row: Urutan & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="urutan" className="text-sm font-bold text-slate-700">
                Urutan Tampil
              </label>
              <input
                id="urutan"
                type="number"
                name="urutan"
                defaultValue="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-slate-700">
                Status Aktif
              </label>
              <select
                id="status"
                name="status"
                defaultValue="true"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <Link
              href="/dashboard/program"
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
              {isSubmitting ? "Menyimpan..." : "Simpan Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
