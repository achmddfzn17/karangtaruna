"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface ChartData {
  bulan: string;
  masuk: number;
  keluar: number;
}

interface KeuanganChartProps {
  data: ChartData[];
}

function formatRupiah(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

export default function KeuanganChart({ data }: KeuanganChartProps) {
  if (data.every((d) => d.masuk === 0 && d.keluar === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Tidak ada data untuk periode ini
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="bulan"
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRupiah}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value) =>
            typeof value === "number"
              ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
              : value
          }
          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
          cursor={{ fill: "#f8fafc" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => (value === "masuk" ? "Pemasukan" : "Pengeluaran")}
        />
        <Bar dataKey="masuk" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="keluar" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
