"use client";

import { Trash2 } from "lucide-react";

interface DeleteProgramButtonProps {
  action: (formData: FormData) => Promise<void>;
  programId: string;
}

export function DeleteProgramButton({ action, programId }: DeleteProgramButtonProps) {
  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Apakah Anda yakin ingin menghapus program ini?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleDelete}>
      <button
        type="submit"
        title="Hapus Program"
        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
      >
        <Trash2 className="w-4.5 h-4.5" />
      </button>
    </form>
  );
}
