"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Trash2, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

interface Sertifikat {
  id: string;
  nomorSertifikat: string;
  namaAnggota: string;
  namaKegiatan: string;
  tanggalTerbit: Date | string;
  qrCode: string | null;
}

interface SertifikatListItemProps {
  sertifikat: Sertifikat;
  onSuccess?: () => void;
}

export function SertifikatListItem({ sertifikat, onSuccess }: SertifikatListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus sertifikat ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sertifikat/${sertifikat.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus sertifikat");

      toast.success("Sertifikat berhasil dihapus");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerateQR = async () => {
    try {
      const res = await fetch(`/api/sertifikat/${sertifikat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateQR: true }),
      });

      if (!res.ok) throw new Error("Gagal regenerate QR code");

      toast.success("QR code berhasil di-regenerate");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{sertifikat.nomorSertifikat}</td>
      <td className="px-4 py-3 text-sm">{sertifikat.namaAnggota}</td>
      <td className="px-4 py-3 text-sm">{sertifikat.namaKegiatan}</td>
      <td className="px-4 py-3 text-sm">
        {new Date(sertifikat.tanggalTerbit).toLocaleDateString("id-ID")}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-600"
            onClick={() => {
              const qrUrl = sertifikat.qrCode;
              if (qrUrl) window.open(qrUrl, "_blank");
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-600"
            onClick={handleRegenerateQR}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
