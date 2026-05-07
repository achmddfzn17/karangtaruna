"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface BulanData {
  nama: string;
  masuk: number;
  keluar: number;
  saldo: number;
}

export default function LaporanKeuanganCharts({ perBulan }: { perBulan: BulanData[] }) {
  const formatter = (value: number) => formatCurrency(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart pemasukan vs pengeluaran */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-5">Pemasukan vs Pengeluaran</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={perBulan} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="nama" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [formatCurrency(typeof v === 'number' ? v : 0)]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="masuk" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="keluar" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart saldo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-5">Tren Saldo Bulanan</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={perBulan}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="nama" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(v) => [formatCurrency(typeof v === 'number' ? v : 0), "Saldo"]}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
