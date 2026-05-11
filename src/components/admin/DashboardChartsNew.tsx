"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface AnggotaData {
  bulan: string;
  jumlah: number;
}

interface KeuanganData {
  bulan: string;
  pemasukan: number;
  pengeluaran: number;
}

interface DashboardChartsNewProps {
  anggotaData: AnggotaData[];
  keuanganData: KeuanganData[];
}

export default function DashboardChartsNew({
  anggotaData,
  keuanganData,
}: DashboardChartsNewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-full bg-slate-100 rounded"></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-full bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Grafik Tren Keanggotaan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Tren Keanggotaan</h3>
              <p className="text-xs text-slate-500">Pertumbuhan anggota 6 bulan terakhir</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={anggotaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: "#64748b" }}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                stroke="#cbd5e1"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Jumlah Anggota"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Grafik Arus Kas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Arus Kas</h3>
              <p className="text-xs text-slate-500">Pemasukan vs Pengeluaran 6 bulan terakhir</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keuanganData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: "#64748b" }}
                stroke="#cbd5e1"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                stroke="#cbd5e1"
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: any) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(Number(value))
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Bar
                dataKey="pemasukan"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Pemasukan"
              />
              <Bar
                dataKey="pengeluaran"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                name="Pengeluaran"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
