"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface KegiatanFiltersProps {
  jenisOptions: FilterOption[];
  statusOptions: FilterOption[];
  currentJenis: string;
  currentStatus: string;
}

export default function KegiatanFilters({
  jenisOptions,
  statusOptions,
  currentJenis,
  currentStatus,
}: KegiatanFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: "jenis" | "status", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    // Reset to page 1 when filter changes
    params.delete("page");
    router.push(`/dashboard/kegiatan?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 items-center">
      <Filter className="w-4 h-4 text-slate-500" />
      <select
        value={currentJenis}
        onChange={(e) => updateFilter("jenis", e.target.value)}
        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        aria-label="Filter berdasarkan jenis"
      >
        {jenisOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
        aria-label="Filter berdasarkan status"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
