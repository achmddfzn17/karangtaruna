"use client";

import { useState } from "react";
import { Anggota } from "@prisma/client";
import { UserPlus, ChevronDown, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PesertaFormProps {
  anggotaAvailable: Anggota[];
  isSubmitting?: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function PesertaForm({ anggotaAvailable, onSubmit, isSubmitting }: PesertaFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-500" />
          Tambah Peserta
        </h2>

        {anggotaAvailable.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Semua anggota aktif sudah terdaftar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="anggotaId" className="text-[12px] font-bold text-slate-600">
                Pilih Anggota
              </label>
              <select
                name="anggotaId"
                id="anggotaId"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih anggota...</option>
                {anggotaAvailable.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.namaLengkap}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading || isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Tambah
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
