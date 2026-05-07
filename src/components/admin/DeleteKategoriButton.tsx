"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  id: string;
  nama: string;
  jumlahTransaksi: number;
}

export default function DeleteKategoriButton({ id, nama, jumlahTransaksi }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (jumlahTransaksi > 0) {
      toast.error(
        `Kategori "${nama}" tidak bisa dihapus karena masih digunakan oleh ${jumlahTransaksi} transaksi.`
      );
      return;
    }
    if (!confirm(`Hapus kategori "${nama}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/keuangan/kategori/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Kategori berhasil dihapus");
      window.location.reload();
    } catch {
      toast.error("Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title={
        jumlahTransaksi > 0
          ? `Tidak bisa dihapus (${jumlahTransaksi} transaksi)`
          : "Hapus kategori"
      }
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
