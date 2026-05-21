"use client";

import { useState } from "react";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  nama: string;
  isSelf: boolean;
  isLastSuperAdmin?: boolean;
}

export default function DeleteAdminButton({ 
  id, 
  nama, 
  isSelf, 
  isLastSuperAdmin = false 
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Disabled states
  const isDisabled = loading || isSelf || isLastSuperAdmin;

  const handleDelete = async () => {
    // Guard clauses
    if (isSelf) {
      toast.error("Tidak bisa menghapus akun Anda sendiri");
      return;
    }
    
    if (isLastSuperAdmin) {
      toast.error("Tidak bisa menghapus Super Admin terakhir");
      return;
    }

    if (!confirm(`Hapus admin "${nama}"?\n\nAkun ini tidak bisa dipulihkan setelah dihapus.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus admin");
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

  // Dynamic title
  let title = `Hapus admin ${nama}`;
  if (isSelf) title = "Tidak bisa hapus akun sendiri";
  else if (isLastSuperAdmin) title = "Tidak bisa hapus Super Admin terakhir";

  return (
    <button
      onClick={handleDelete}
      disabled={isDisabled}
      title={title}
      aria-label={title}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Menghapus...
        </>
      ) : isLastSuperAdmin ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5" />
          Terkunci
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
