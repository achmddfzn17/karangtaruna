"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteConfirmButtonProps {
  // New API (preferred)
  id?: string;
  name?: string;
  onDelete?: (id: string) => Promise<void>;
  itemType?: string;
  
  // Legacy API (backward compatibility)
  action?: (formData: FormData) => Promise<void>;
  itemId?: string;
  message?: string;
  className?: string;
  title?: string;
  formChildren?: React.ReactNode;
}

export function DeleteConfirmButton({
  id,
  name,
  onDelete,
  itemType = "item",
  action,
  itemId,
  message,
  className,
  title = "Hapus",
  formChildren,
}: DeleteConfirmButtonProps) {
  const [isPending, startTransition] = useTransition();

  // NEW API: Use id + onDelete
  if (id && onDelete) {
    const itemName = name || "item";
    const confirmMessage = `Yakin ingin menghapus ${itemType} "${itemName}"?\n\nTindakan ini tidak dapat dibatalkan.`;

    const handleClick = () => {
      if (!confirm(confirmMessage)) return;

      startTransition(async () => {
        try {
          await onDelete(id);
          toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} "${itemName}" berhasil dihapus`);
        } catch (error) {
          const msg = error instanceof Error ? error.message : `Gagal menghapus ${itemType}`;
          toast.error(msg);
        }
      });
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={`Hapus ${itemType} ${itemName}`}
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

  // LEGACY API: Use action + itemId (for backward compatibility)
  if (action && itemId) {
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
      const confirmMsg = message || "Hapus item ini?";
      if (!confirm(confirmMsg)) {
        e.preventDefault();
      }
    };

    return (
      <form action={action}>
        <input type="hidden" name="id" value={itemId} />
        {formChildren}
        <button
          type="submit"
          className={className || "p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"}
          onClick={handleDelete}
          title={title}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return null;
}
