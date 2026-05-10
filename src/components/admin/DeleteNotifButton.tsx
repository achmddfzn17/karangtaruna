"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteNotifButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/notifikasi/${id}`, { method: "DELETE" });
      toast.success("Notifikasi berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus notifikasi");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0 opacity-0 group-hover:opacity-100"
      title="Hapus notifikasi"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
