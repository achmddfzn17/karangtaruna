"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit2, Trash2, Save, X } from "lucide-react";

interface IuranEditProps {
  iuran: any;
  onSuccess?: () => void;
}

export function IuranEditModal({ iuran, onSuccess }: IuranEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jumlah: iuran.jumlah,
    tanggalBayar: format(new Date(iuran.tanggalBayar), "yyyy-MM-dd"),
    keterangan: iuran.keterangan || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/iuran/${iuran.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal memperbarui iuran");

      toast.success("Iuran berhasil diperbarui");
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-700"
      >
        <Edit2 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Iuran</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Bayar</label>
                <Input
                  type="date"
                  value={formData.tanggalBayar}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalBayar: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Keterangan</label>
                <Input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Opsional"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600">
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
