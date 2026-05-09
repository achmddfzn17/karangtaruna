"use client";

import { useState } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface IuranRecord {
  id: string;
  jumlah: number;
  tanggalBayar: string | Date;
  keterangan?: string | null;
}

interface DeleteIuranButtonProps {
  id: string;
  data?: IuranRecord;
}

export default function DeleteIuranButton({ id, data }: DeleteIuranButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initialTanggal = data?.tanggalBayar
    ? typeof data.tanggalBayar === "string"
      ? data.tanggalBayar.split("T")[0]
      : new Date(data.tanggalBayar).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const [editData, setEditData] = useState({
    jumlah: data?.jumlah || 0,
    tanggalBayar: initialTanggal,
    keterangan: data?.keterangan ?? "",
  });
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Hapus catatan iuran ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/iuran/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Catatan iuran dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editData.jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/iuran/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jumlah: editData.jumlah,
          tanggalBayar: editData.tanggalBayar,
          keterangan: editData.keterangan,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Catatan iuran berhasil diperbarui");
      setIsEditOpen(false);
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-1">
        {data && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit catatan iuran"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Hapus catatan iuran"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Catatan Iuran</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Jumlah (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={editData.jumlah}
                  onChange={(e) =>
                    setEditData({ ...editData, jumlah: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tanggal Bayar</label>
                <input
                  type="date"
                  value={editData.tanggalBayar}
                  onChange={(e) =>
                    setEditData({ ...editData, tanggalBayar: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Keterangan</label>
                <input
                  type="text"
                  value={editData.keterangan}
                  onChange={(e) =>
                    setEditData({ ...editData, keterangan: e.target.value })
                  }
                  placeholder="Opsional"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
