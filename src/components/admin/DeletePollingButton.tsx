"use client";

import { Trash2 } from "lucide-react";

interface DeletePollingButtonProps {
  action: (formData: FormData) => Promise<void>;
  pollingId: string;
}

export default function DeletePollingButton({ action, pollingId }: DeletePollingButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={pollingId} />
      <button
        type="submit"
        className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        onClick={(e) => {
          if (!confirm("Hapus voting ini? Semua data suara akan hilang.")) e.preventDefault();
        }}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
