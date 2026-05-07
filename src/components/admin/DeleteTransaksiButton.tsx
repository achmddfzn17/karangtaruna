"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTransaksi } from "@/app/(admin)/dashboard/keuangan/actions";
import { toast } from "sonner";

interface DeleteTransaksiButtonProps {
  id: string;
  keterangan: string;
}

export default function DeleteTransaksiButton({ id, keterangan }: DeleteTransaksiButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus transaksi "${keterangan}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    setLoading(true);
    try {
      await deleteTransaksi(id);
      toast.success("Transaksi berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus transaksi");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Hapus Transaksi"
      aria-label="Hapus Transaksi"
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
