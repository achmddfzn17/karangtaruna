"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";

// ==========================================
// 1. DONUT CHART — Distribusi Status Anggota
// ==========================================
interface AnggotaChartProps {
  data: { name: string; value: number; color: string }[];
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function AnggotaStatusChart({ data }: AnggotaChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-bold text-slate-900 mb-1">
        Distribusi Anggota
      </h3>
      <p className="text-[11px] text-slate-400 font-medium mb-4">
        Berdasarkan status keanggotaan
      </p>

      {total === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
          Belum ada data anggota
        </div>
      ) : (
        <>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-[11px] text-slate-500 font-semibold">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 2. BAR CHART — Kegiatan per Jenis
// ==========================================
interface KegiatanChartProps {
  data: { name: string; jumlah: number }[];
}

export function KegiatanJenisChart({ data }: KegiatanChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-bold text-slate-900 mb-1">
        Kegiatan per Kategori
      </h3>
      <p className="text-[11px] text-slate-400 font-medium mb-4">
        Distribusi jenis kegiatan yang telah dilaksanakan
      </p>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
          Belum ada data kegiatan
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="jumlah" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. AREA CHART — Tren Konten Bulanan
// ==========================================
interface KontenTrenProps {
  data: { bulan: string; berita: number; artikel: number }[];
}

export function KontenTrenChart({ data }: KontenTrenProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-bold text-slate-900 mb-1">
        Tren Publikasi Konten
      </h3>
      <p className="text-[11px] text-slate-400 font-medium mb-4">
        Jumlah berita &amp; artikel yang dipublikasikan per bulan
      </p>

      {data.every((d) => d.berita === 0 && d.artikel === 0) ? (
        <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
          Belum ada data publikasi
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBerita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArtikel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="berita"
                name="Berita"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#colorBerita)"
              />
              <Area
                type="monotone"
                dataKey="artikel"
                name="Artikel"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#colorArtikel)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
