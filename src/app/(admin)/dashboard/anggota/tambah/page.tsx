"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, AlertCircle, UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";
import { createAnggota } from "./actions";
import { toast } from "sonner";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

export default function TambahAnggotaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [buatAkun, setBuatAkun] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("buatAkun", buatAkun ? "true" : "false");

    try {
      await createAnggota(formData);
      toast.success("Anggota berhasil ditambahkan!");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 text-sm";
  const labelCls = "text-sm font-bold text-slate-700";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/anggota"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Tambah Anggota</h1>
          <p className="text-sm text-slate-500 mt-1">Daftarkan anggota Karang Taruna baru</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Data Pribadi ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100">
            Data Pribadi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="namaLengkap" className={labelCls}>Nama Lengkap <span className="text-red-500">*</span></label>
              <input id="namaLengkap" type="text" name="namaLengkap" required placeholder="Masukkan nama lengkap" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="nik" className={labelCls}>NIK <span className="text-red-500">*</span></label>
              <input id="nik" type="text" name="nik" required maxLength={16} placeholder="16 digit NIK" className={`${inputCls} font-mono`} />
            </div>
            <div className="space-y-2">
              <label htmlFor="tempatLahir" className={labelCls}>Tempat Lahir</label>
              <input id="tempatLahir" type="text" name="tempatLahir" placeholder="Contoh: Jakarta" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="tanggalLahir" className={labelCls}>Tanggal Lahir</label>
              <input id="tanggalLahir" type="date" name="tanggalLahir" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="jenisKelamin" className={labelCls}>Jenis Kelamin <span className="text-red-500">*</span></label>
              <select id="jenisKelamin" name="jenisKelamin" required className={`${inputCls} bg-white`}>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className={labelCls}>Status Anggota <span className="text-red-500">*</span></label>
              <select id="status" name="status" required className={`${inputCls} bg-white`}>
                <option value="AKTIF">Aktif</option>
                <option value="NON_AKTIF">Non-Aktif</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="noHp" className={labelCls}>No. Handphone</label>
              <input id="noHp" type="tel" name="noHp" placeholder="081234567890" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className={labelCls}>Email Kontak</label>
              <input id="email" type="email" name="email" placeholder="nama@email.com" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="pekerjaan" className={labelCls}>Pekerjaan</label>
              <input id="pekerjaan" type="text" name="pekerjaan" placeholder="Mahasiswa, Wirausaha, dll" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="pendidikan" className={labelCls}>Pendidikan Terakhir</label>
              <select id="pendidikan" name="pendidikan" className={`${inputCls} bg-white`}>
                <option value="">-- Pilih --</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="alamat" className={labelCls}>Alamat Lengkap</label>
              <textarea id="alamat" name="alamat" rows={3} placeholder="Masukkan alamat lengkap" className={`${inputCls} resize-none`} />
            </div>

            {/* Foto Profil */}
            <div className="md:col-span-2">
              <ThumbnailUpload
                name="foto"
                folder="anggota"
                label="Foto Profil (Opsional)"
              />
            </div>
          </div>
        </div>

        {/* ── Akun Login ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toggle header */}
          <button
            type="button"
            onClick={() => setBuatAkun(!buatAkun)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${buatAkun ? "bg-blue-600" : "bg-slate-100"}`}>
                <UserPlus className={`w-5 h-5 ${buatAkun ? "text-white" : "text-slate-400"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Buat Akun Login Portal Anggota</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {buatAkun ? "Anggota akan bisa login ke portal member" : "Opsional — bisa dibuat nanti"}
                </p>
              </div>
            </div>
            {/* Toggle switch */}
            <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${buatAkun ? "bg-blue-600" : "bg-slate-200"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${buatAkun ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>

          {/* Form akun — muncul saat toggle aktif */}
          {buatAkun && (
            <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-5">
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">Akun ini digunakan anggota untuk login ke <strong>/anggota/login</strong></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="loginEmail" className={labelCls}>
                    Email Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    name="loginEmail"
                    required={buatAkun}
                    placeholder="email@contoh.com"
                    className={inputCls}
                  />
                  <p className="text-[11px] text-slate-400">Digunakan untuk login, harus unik</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="loginPassword" className={labelCls}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      name="loginPassword"
                      required={buatAkun}
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Minimal 8 karakter</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pb-4">
          <Link href="/dashboard/anggota" className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Menyimpan..." : buatAkun ? "Simpan + Buat Akun" : "Simpan Anggota"}
          </button>
        </div>
      </form>
    </div>
  );
}
