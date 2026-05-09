"use client";

import { Trash2 } from "lucide-react";

interface DeleteConfirmButtonProps {
  action: (formData: FormData) => Promise<void>;
  itemId: string;
  message?: string;
  className?: string;
  title?: string;
  formChildren?: React.ReactNode;
}

export function DeleteConfirmButton({
  action,
  itemId,
  message = "Hapus item ini?",
  className = "p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90",
  title = "Hapus",
  formChildren,
}: DeleteConfirmButtonProps) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(message)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action}>
      <input type="hidden" name="id" value={itemId} />
      {formChildren}
      <button
        type="submit"
        className={className}
        onClick={handleDelete}
        title={title}
      >
        <Trash2 className="w-4.5 h-4.5" />
      </button>
    </form>
  );
}
