"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  nama: string;
  isSelf: boolean;
}

export default function DeleteAdminButton({ id, nama, isSelf }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isSelf) {
      toast.error("Tidak bisa menghapus akun Anda sendiri");
      return;
    }
    if (!confirm(`Hapus admin "${nama}"?\n\nAkun ini tidak bisa dipulihkan setelah dihapus.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus");
      }
      toast.success(`Admin "${nama}" berhasil dihapus`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus admin";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading || isSelf}
      title={isSelf ? "Tidak bisa hapus akun sendiri" : `Hapus admin ${nama}`}
      aria-label={isSelf ? "Tidak bisa hapus akun sendiri" : `Hapus admin ${nama}`}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
  );
}
