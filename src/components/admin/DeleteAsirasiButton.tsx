"use client";

import { Trash2 } from "lucide-react";

interface DeleteAspirasiButtonProps {
  action: (formData: FormData) => Promise<void>;
  aspirasiId: string;
}

export default function DeleteAspirasiButton({ action, aspirasiId }: DeleteAspirasiButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={aspirasiId} />
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
        onClick={(e) => {
          if (!confirm("Hapus aspirasi ini?")) e.preventDefault();
        }}
      >
        <Trash2 className="w-4 h-4" />
        Hapus Aspirasi
      </button>
    </form>
  );
}
