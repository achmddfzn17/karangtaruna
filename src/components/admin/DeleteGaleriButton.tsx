"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteGaleriButtonProps {
  id: string;
  judul: string;
}

export default function DeleteGaleriButton({ id, judul }: DeleteGaleriButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success(`"${judul}" berhasil dihapus`);
      // Refresh halaman untuk update list
      window.location.reload();
    } catch {
      toast.error("Gagal menghapus dokumentasi");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[11px] font-bold text-red-500 hover:text-red-600 disabled:opacity-50 flex items-center gap-1"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      Hapus
    </button>
  );
}
