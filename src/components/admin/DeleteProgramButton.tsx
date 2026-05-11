"use client";

import { Trash2 } from "lucide-react";

interface DeleteProgramButtonProps {
  action: (formData: FormData) => Promise<void>;
  programId: string;
}

export function DeleteProgramButton({ action, programId }: DeleteProgramButtonProps) {
  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program ini? Tindakan ini tidak dapat dibatalkan.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleDelete} className="inline-flex">
      <button
        type="submit"
        title="Hapus Program"
        aria-label="Hapus Program"
        data-program-id={programId}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Hapus
      </button>
    </form>
  );
}
