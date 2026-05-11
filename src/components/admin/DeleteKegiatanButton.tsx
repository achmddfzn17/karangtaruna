"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteKegiatanButtonProps {
  id: string;
  nama: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteKegiatanButton({
  id,
  nama,
  onDelete,
}: DeleteKegiatanButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Yakin ingin menghapus kegiatan "${nama}"?\n\nTindakan ini akan menghapus:\n- Data kegiatan\n- Semua galeri terkait\n- Data peserta kegiatan\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    startTransition(async () => {
      try {
        await onDelete(id);
        toast.success(`Kegiatan "${nama}" berhasil dihapus`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal menghapus kegiatan";
        toast.error(message);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Hapus kegiatan ${nama}`}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? (
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
