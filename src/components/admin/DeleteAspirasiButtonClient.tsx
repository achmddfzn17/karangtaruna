"use client";

import { Trash2 } from "lucide-react";

interface DeleteAspirasiButtonProps {
  action: (formData: FormData) => Promise<void>;
  aspirasId: string;
}

export function DeleteAspirasiButton({ action, aspirasId }: DeleteAspirasiButtonProps) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm("Hapus aspirasi ini?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={action}>
      <input type="hidden" name="id" value={aspirasId} />
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
        Hapus Aspirasi
      </button>
    </form>
  );
}
