"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAnggota } from "@/app/(admin)/dashboard/anggota/actions";
import { toast } from "sonner";

interface DeleteAnggotaButtonProps {
  id: string;
  nama: string;
}

export default function DeleteAnggotaButton({ id, nama }: DeleteAnggotaButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus anggota "${nama}"? Data yang dihapus tidak dapat dikembalikan.`)) return;

    setLoading(true);
    try {
      await deleteAnggota(id);
      toast.success(`Anggota "${nama}" berhasil dihapus`);
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus anggota");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus Anggota"
      aria-label="Hapus Anggota"
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
