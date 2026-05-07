"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { toast } from "sonner";

interface ThumbnailUploadProps {
  name?: string;
  defaultUrl?: string | null;
  bucket?: string;
  folder?: string;
  label?: string;
}

export default function ThumbnailUpload({
  name = "thumbnail",
  defaultUrl,
  bucket = "galeri",
  folder = "thumbnails",
  label = "Thumbnail",
}: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(defaultUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      setUploadedUrl(data.publicUrl);
      setPreview(data.publicUrl);
      toast.success("Thumbnail berhasil diupload");
    } catch (err: any) {
      toast.error("Gagal upload: " + (err.message || "Coba lagi"));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>

      {/* Hidden input yang menyimpan URL untuk dikirim ke server action */}
      <input type="hidden" name={name} value={uploadedUrl} />

      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
          <img
            src={preview}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-slate-500">Mengupload...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
                  Klik atau drag & drop gambar
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Maks 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
