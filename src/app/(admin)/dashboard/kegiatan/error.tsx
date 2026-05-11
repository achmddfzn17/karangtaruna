"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function KegiatanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[KEGIATAN_ERROR]", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-200 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600 rounded-xl">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Gagal memuat data kegiatan. Silakan coba lagi.
            </p>
            <p className="text-xs text-red-700 mt-3 font-mono bg-red-50 p-2 rounded-lg border border-red-100">
              {error.message || "Unknown error"}
            </p>
            <button
              onClick={reset}
              className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
