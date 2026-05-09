"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, CreditCard, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Iuran {
  id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggalBayar: Date;
  keterangan: string | null;
}

interface IuranListProps {
  iuranList: Iuran[];
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function IuranList({ iuranList }: IuranListProps) {
  const [expandedYear, setExpandedYear] = useState<number | null>(
    new Date().getFullYear()
  );

  // Group by year
  const groupedByYear = iuranList.reduce((acc, iuran) => {
    if (!acc[iuran.tahun]) {
      acc[iuran.tahun] = [];
    }
    acc[iuran.tahun].push(iuran);
    return acc;
  }, {} as Record<number, Iuran[]>);

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Riwayat Pembayaran
        </h3>
      </div>

      {iuranList.length === 0 ? (
        <div className="p-12 text-center">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada riwayat pembayaran</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {years.map((year) => {
            const yearIuran = groupedByYear[year];
            const yearTotal = yearIuran.reduce((sum, i) => sum + i.jumlah, 0);
            const isExpanded = expandedYear === year;

            return (
              <div key={year}>
                {/* Year Header */}
                <button
                  onClick={() => setExpandedYear(isExpanded ? null : year)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-900">Tahun {year}</h4>
                      <p className="text-xs text-slate-500">
                        {yearIuran.length} pembayaran • {formatCurrency(yearTotal)}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Year Details */}
                {isExpanded && (
                  <div className="bg-slate-50 px-4 pb-4">
                    <div className="space-y-2">
                      {yearIuran.map((iuran) => (
                        <div
                          key={iuran.id}
                          className="bg-white rounded-lg p-4 border border-slate-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-bold text-slate-900 text-sm">
                                  {BULAN_NAMES[iuran.bulan - 1]} {iuran.tahun}
                                </h5>
                                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                                  Lunas
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(
                                    new Date(iuran.tanggalBayar),
                                    "d MMMM yyyy",
                                    { locale: localeId }
                                  )}
                                </div>
                              </div>
                              {iuran.keterangan && (
                                <p className="text-xs text-slate-600 mt-2">
                                  {iuran.keterangan}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-extrabold text-green-600">
                                {formatCurrency(iuran.jumlah)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
