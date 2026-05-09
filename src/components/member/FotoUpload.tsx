"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface FotoUploadProps {
  currentFoto: string | null;
  avatarUrl: string;
  namaLengkap: string;
  anggotaId: string;
}

export default function FotoUpload({ currentFoto, avatarUrl, namaLengkap, anggotaId }: FotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("anggotaId", anggotaId);

      const res = await fetch("/api/member/foto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload gagal");

      setStatus("success");
      setPreview(null);
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = preview || avatarUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative group">
        <img
          src={displayUrl}
          alt={namaLengkap}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
        />
        {/* Camera overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Actions when preview selected */}
      {preview ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            {uploading ? "Mengupload..." : "Simpan Foto"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <X className="w-3 h-3" />
            Batal
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          <Camera className="w-3 h-3" />
          Ganti Foto
        </button>
      )}

      {/* Status messages */}
      {status === "success" && (
        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" /> Foto berhasil diperbarui
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500 font-semibold">
          Gagal upload. Maks 2MB (JPG/PNG/WebP)
        </p>
      )}

      <p className="text-[10px] text-slate-400">Maks 2MB · JPG, PNG, WebP</p>
    </div>
  );
}
