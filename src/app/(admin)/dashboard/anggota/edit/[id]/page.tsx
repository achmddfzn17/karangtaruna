"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, AlertCircle, Loader2 } from "lucide-react";
import { updateAnggota } from "../../actions";
import { toast } from "sonner";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";

interface Anggota {
  id: string;
  namaLengkap: string;
  nik: string;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  alamat: string | null;
  noHp: string | null;
  email: string | null;
  pekerjaan: string | null;
  pendidikan: string | null;
  status: "AKTIF" | "NON_AKTIF" | "ALUMNI";
  foto: string | null;
}

export default function EditAnggotaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/anggota/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Anggota tidak ditemukan");
        return res.json();
      })
      .then((data) => {
        if (data.tanggalLahir) {
          data.tanggalLahir = new Date(data.tanggalLahir).toISOString().split("T")[0];
        }
        setAnggota(data);
      })
      .catch(() => router.push("/dashboard/anggota"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    try {
      await updateAnggota(id, formData);
      toast.success("Data anggota berhasil diperbarui!");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!anggota) return null;

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
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Anggota</h1>
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{anggota.namaLengkap}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" name="namaLengkap" required defaultValue={anggota.namaLengkap} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">NIK <span className="text-red-500">*</span></label>
              <input type="text" name="nik" required maxLength={16} defaultValue={anggota.nik} className={`${inputCls} font-mono`} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tempat Lahir</label>
              <input type="text" name="tempatLahir" defaultValue={anggota.tempatLahir || ""} placeholder="Contoh: Jakarta" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tanggal Lahir</label>
              <input type="date" name="tanggalLahir" defaultValue={anggota.tanggalLahir || ""} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Jenis Kelamin <span className="text-red-500">*</span></label>
              <select name="jenisKelamin" required defaultValue={anggota.jenisKelamin} className={`${inputCls} bg-white`}>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Status Anggota <span className="text-red-500">*</span></label>
              <select name="status" required defaultValue={anggota.status} className={`${inputCls} bg-white`}>
                <option value="AKTIF">Aktif</option>
                <option value="NON_AKTIF">Non-Aktif</option>
                <option value="ALUMNI">Alumni</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">No. Handphone</label>
              <input type="tel" name="noHp" defaultValue={anggota.noHp || ""} placeholder="081234567890" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input type="email" name="email" defaultValue={anggota.email || ""} placeholder="nama@email.com" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Pekerjaan</label>
              <input type="text" name="pekerjaan" defaultValue={anggota.pekerjaan || ""} placeholder="Mahasiswa, Wirausaha" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Pendidikan Terakhir</label>
              <select name="pendidikan" defaultValue={anggota.pendidikan || ""} className={`${inputCls} bg-white`}>
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
              <label className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
              <textarea name="alamat" rows={3} defaultValue={anggota.alamat || ""} placeholder="Masukkan alamat lengkap" className={`${inputCls} resize-none`} />
            </div>

            {/* Foto Profil */}
            <div className="md:col-span-2">
              <ThumbnailUpload
                name="foto"
                defaultUrl={anggota.foto}
                folder="anggota"
                label="Foto Profil (Opsional)"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
            <Link href="/dashboard/anggota" className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
