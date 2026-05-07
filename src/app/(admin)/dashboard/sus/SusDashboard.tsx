"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ClipboardList, TrendingUp, CheckCircle2, AlertTriangle,
  XCircle, Trash2, Download, ExternalLink, Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface SusResponse {
  id: string;
  responden: string | null;
  score: number;
  kategori: string;
  createdAt: Date;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
}

interface Props {
  responses: SusResponse[];
  stats: { total: number; avgScore: number; acceptable: number; marginal: number; notAcceptable: number };
  distribution: { range: string; count: number }[];
  avgPerQ: number[];
  deleteResponse: (id: string) => Promise<void>;
}

const susQuestions = [
  "Sering digunakan", "Terlalu rumit", "Mudah digunakan", "Butuh bantuan teknis",
  "Fungsi terintegrasi", "Banyak ketidakkonsistenan", "Cepat dipelajari",
  "Merepotkan", "Percaya diri menggunakan", "Harus belajar banyak",
];

function getKategoriColor(kategori: string) {
  if (kategori === "Acceptable") return "bg-green-100 text-green-700";
  if (kategori === "Marginal") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getScoreColor(score: number) {
  if (score >= 71.4) return "text-green-600";
  if (score >= 50.9) return "text-amber-600";
  return "text-red-500";
}

function getGrade(score: number) {
  if (score >= 85) return { grade: "A", label: "Excellent" };
  if (score >= 71.4) return { grade: "B", label: "Good" };
  if (score >= 62.5) return { grade: "C", label: "OK" };
  if (score >= 50.9) return { grade: "D", label: "Poor" };
  return { grade: "F", label: "Awful" };
}

export default function SusDashboard({ responses, stats, distribution, avgPerQ, deleteResponse }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterKategori, setFilterKategori] = useState<string>("ALL");

  const { grade, label } = getGrade(stats.avgScore);

  const barData = avgPerQ.map((avg, i) => ({
    name: `Q${i + 1}`,
    nilai: parseFloat(avg.toFixed(2)),
    // warna berbeda untuk pertanyaan positif (ganjil) vs negatif (genap)
    positif: (i + 1) % 2 !== 0,
  }));

  const filtered = filterKategori === "ALL"
    ? responses
    : responses.filter((r) => r.kategori === filterKategori);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data responden "${nama}"?`)) return;
    setDeleting(id);
    try {
      await deleteResponse(id);
      toast.success("Data berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus data");
    } finally {
      setDeleting(null);
    }
  };

  const exportExcel = () => {
    const data = responses.map((r, i) => ({
      No: i + 1,
      Responden: r.responden || "Anonim",
      Q1: r.q1, Q2: r.q2, Q3: r.q3, Q4: r.q4, Q5: r.q5,
      Q6: r.q6, Q7: r.q7, Q8: r.q8, Q9: r.q9, Q10: r.q10,
      "Skor SUS": r.score.toFixed(2),
      Kategori: r.kategori,
      Tanggal: new Date(r.createdAt).toLocaleDateString("id-ID"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data SUS");
    XLSX.writeFile(wb, `SUS_Karang_Taruna_${Date.now()}.xlsx`);
    toast.success("Export berhasil!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kuisioner SUS</h1>
          <p className="text-sm text-slate-500 mt-1">Analisis System Usability Scale website Karang Taruna</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/sus"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Buka Form
          </a>
          <button
            onClick={exportExcel}
            disabled={stats.total === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Skor rata-rata — card besar */}
        <div className="col-span-2 lg:col-span-1 bg-blue-600 rounded-2xl p-6 text-white shadow-sm shadow-blue-500/20 flex flex-col justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Rata-rata Skor</p>
          <div>
            <p className="text-5xl font-black mt-2">{stats.avgScore.toFixed(1)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-black">{grade}</span>
              <span className="text-sm font-bold text-blue-200">{label}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-slate-500 font-bold uppercase">Total Responden</p>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-green-600 font-bold uppercase">Acceptable</p>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold text-green-600">{stats.acceptable}</p>
          <p className="text-[11px] text-slate-400 mt-1">≥ 71.4</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-amber-600 font-bold uppercase">Marginal</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{stats.marginal}</p>
          <p className="text-[11px] text-slate-400 mt-1">50.9 – 71.4</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-red-500 font-bold uppercase">Not Acceptable</p>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-extrabold text-red-500">{stats.notAcceptable}</p>
          <p className="text-[11px] text-slate-400 mt-1">{"< 50.9"}</p>
        </div>
      </div>

      {/* Charts */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Skor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Distribusi Skor
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v) => [`${v} responden`, "Jumlah"]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart rata-rata per pertanyaan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-purple-500" />
              Rata-rata per Pertanyaan
            </h2>
            <p className="text-[11px] text-slate-400 mb-5">
              Skala 1–5 &nbsp;·&nbsp;
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Pertanyaan positif
              </span>
              &nbsp;·&nbsp;
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" /> Pertanyaan negatif
              </span>
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                barSize={14}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v: number, _name: string, props: any) => [
                    `${v} / 5`,
                    props.payload.positif ? "Pertanyaan Positif" : "Pertanyaan Negatif",
                  ]}
                  labelFormatter={(label) => {
                    const idx = parseInt(label.replace("Q", "")) - 1;
                    return susQuestions[idx] || label;
                  }}
                />
                <Bar dataKey="nilai" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.positif ? "#3b82f6" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-sm font-bold text-slate-800">
            Data Responden ({filtered.length})
          </h2>
          <div className="flex gap-2">
            {["ALL", "Acceptable", "Marginal", "Not Acceptable"].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKategori(k)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  filterKategori === k
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {k === "ALL" ? "Semua" : k}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">Belum ada data responden</p>
            <p className="text-xs text-slate-400 mt-1">
              Bagikan link form ke pengguna untuk mulai mengumpulkan data
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Responden</th>
                  {Array.from({ length: 10 }, (_, i) => (
                    <th key={i} className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-2">Q{i + 1}</th>
                  ))}
                  <th className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Skor</th>
                  <th className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Kategori</th>
                  <th className="text-left text-[11px] text-slate-500 font-bold uppercase tracking-wider py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800">{r.responden || "Anonim"}</td>
                    {[r.q1, r.q2, r.q3, r.q4, r.q5, r.q6, r.q7, r.q8, r.q9, r.q10].map((q, i) => (
                      <td key={i} className="py-3 px-2 text-center text-sm text-slate-600">{q}</td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-extrabold ${getScoreColor(r.score)}`}>
                        {r.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${getKategoriColor(r.kategori)}`}>
                        {r.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(r.id, r.responden || "Anonim")}
                        disabled={deleting === r.id}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legenda pertanyaan */}
        {stats.total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Keterangan Pertanyaan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {susQuestions.map((q, i) => (
                <p key={i} className="text-[11px] text-slate-400">
                  <span className="font-bold text-slate-600">Q{i + 1}:</span> {q}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
