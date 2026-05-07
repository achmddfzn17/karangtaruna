"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteIuranButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Hapus catatan iuran ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/iuran/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Catatan iuran dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Hapus catatan iuran"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
