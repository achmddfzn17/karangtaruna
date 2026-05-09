"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface AttendanceToggleProps {
  anggotaKegiatanId: string;
  kegiatanId: string;
  currentStatus: boolean;
  namaAnggota: string;
  onSuccess?: () => void;
}

export function AttendanceToggle({
  anggotaKegiatanId,
  kegiatanId,
  currentStatus,
  namaAnggota,
  onSuccess,
}: AttendanceToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (hadir: boolean) => {
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/kegiatan/${kegiatanId}/absensi/${anggotaKegiatanId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hadir }),
        }
      );

      if (!res.ok) throw new Error("Gagal memperbarui absensi");

      toast.success(`${namaAnggota} - ${hadir ? "Hadir" : "Tidak Hadir"}`);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={currentStatus ? "default" : "outline"}
        onClick={() => handleToggle(true)}
        disabled={isLoading}
        className={currentStatus ? "bg-green-600 hover:bg-green-700" : ""}
      >
        <Check className="w-4 h-4" />
        Hadir
      </Button>
      <Button
        size="sm"
        variant={!currentStatus ? "destructive" : "outline"}
        onClick={() => handleToggle(false)}
        disabled={isLoading}
      >
        <X className="w-4 h-4" />
        Tidak
      </Button>
    </div>
  );
}
