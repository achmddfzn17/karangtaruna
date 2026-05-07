"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

interface DeletePollingButtonProps {
  action: (formData: FormData) => Promise<void>;
  pollingId: string;
}

export default function DeletePollingButton({ action, pollingId }: DeletePollingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", pollingId);
      await action(formData);
    } catch (error) {
      console.error("[DELETE_POLLING_BUTTON_ERROR]", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        title="Hapus voting"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Voting?"
        description="Semua data suara akan hilang dan tidak dapat dikembalikan. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={isLoading}
        variant="destructive"
      />
    </>
  );
}
