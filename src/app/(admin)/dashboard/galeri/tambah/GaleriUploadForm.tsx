"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Upload,
  X,
  Film,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Kegiatan {
  id: string;
  nama: string;
  status: string;
}

interface Props {
  kegiatanList: Kegiatan[];
  defaultKegiatanId: string;
}

export default function GaleriUploadForm({ kegiatanList, defaultKegiatanId }: Props) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"FOTO" | "VIDEO">("FOTO");
  const [isDragging, setIsDragging] = useState(false);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kegiatanId, setKegiatanId] = useState(defaultKegiatanId);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      const isVideo = f.type.startsWith("video/");
      const isImage = f.type.startsWith("image/");

      if (!isVideo && !isImage) {
        toast.error("Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, MP4, WebM, atau MOV.");
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 50MB");
        return;
      }

      setFile(f);
      setFileType(isVideo ? "VIDEO" : "FOTO");
      setError("");

      // Auto-isi judul dari nama file
      if (!judul) {
        setJudul(f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }

      // Preview untuk gambar
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
    },
    [judul]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { setError("Pilih file terlebih dahulu"); return; }
    if (!judul.trim()) { setError("Judul wajib diisi"); return; }

    setError("");
    setUploading(true);
    setUploadProgress(20);

    try {
      // 1. Upload file ke server
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadRes = await fetch("/api/galeri/upload", {
        method: "POST",
        body: uploadForm,
      });

      setUploadProgress(70);

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Gagal mengupload file");
      }

      const { url } = await uploadRes.json();
      setUploadProgress(85);

      // 2. Simpan ke database
      const saveRes = await fetch("/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: judul.trim(),
          url,
          type: fileType,
          deskripsi: deskripsi.trim() || null,
          kegiatanId: kegiatanId || null,
        }),
      });

      setUploadProgress(100);

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Gagal menyimpan data");
      }

      toast.success("Dokumentasi berhasil ditambahkan!");
      router.push("/dashboard/galeri");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700">File Media</h2>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Drag & drop atau{" "}
                  <span className="text-blue-600">klik untuk pilih file</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, WebP, GIF, MP4, WebM, MOV — Maks. 50MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
            ) : (
              <div className="w-full h-40 bg-slate-800 flex flex-col items-center justify-center gap-2 text-white">
                <Film className="w-10 h-10 opacity-60" />
                <p className="text-sm font-bold opacity-80 px-4 text-center line-clamp-1">{file.name}</p>
              </div>
            )}

            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {fileType === "FOTO" ? (
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                ) : (
                  <Film className="w-4 h-4 text-purple-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 line-clamp-1 max-w-[220px]">{file.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {fileType} · {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploading && uploadProgress > 0 && (
              <div className="px-3 pb-3 bg-white">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Mengupload... {uploadProgress}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-700">Detail Dokumentasi</h2>

        {/* Judul */}
        <div className="space-y-1.5">
          <label htmlFor="judul" className="text-[12px] font-bold text-slate-600">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            id="judul"
            type="text"
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Contoh: Foto Bakti Sosial 2025"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Kegiatan Terkait */}
        <div className="space-y-1.5">
          <label htmlFor="kegiatanId" className="text-[12px] font-bold text-slate-600">
            Kegiatan Terkait
            {defaultKegiatanId && (
              <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Auto-terdeteksi
              </span>
            )}
          </label>
          <select
            id="kegiatanId"
            value={kegiatanId}
            onChange={(e) => setKegiatanId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">-- Tidak terkait kegiatan --</option>
            {kegiatanList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
          {defaultKegiatanId && kegiatanId === defaultKegiatanId && (
            <p className="text-[11px] text-green-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Kegiatan yang sedang berlangsung otomatis dipilih
            </p>
          )}
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <label htmlFor="deskripsi" className="text-[12px] font-bold text-slate-600">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="deskripsi"
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Keterangan singkat tentang dokumentasi ini..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/dashboard/galeri"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={uploading || !file}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
          ) : (
            <><ImagePlus className="w-4 h-4" /> Simpan Dokumentasi</>
          )}
        </button>
      </div>
    </form>
  );
}
