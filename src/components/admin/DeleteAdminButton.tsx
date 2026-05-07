"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
    if (!confirm(`Hapus admin "${nama}"? Akun ini tidak bisa dipulihkan.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus");
      }
      toast.success(`Admin "${nama}" berhasil dihapus`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading || isSelf}
      title={isSelf ? "Tidak bisa hapus akun sendiri" : "Hapus admin"}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
