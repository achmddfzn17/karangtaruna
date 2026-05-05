import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";

export const metadata = { title: "Data Anggota" };

export default async function DataAnggotaPage() {
  const anggotaList = await prisma.anggota.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  const totalAktif = anggotaList.filter((a) => a.status === "AKTIF").length;
  const totalNonAktif = anggotaList.filter((a) => a.status === "NON_AKTIF").length;
  const totalAlumni = anggotaList.filter((a) => a.status === "ALUMNI").length;

  const statusColor: Record<string, string> = {
    AKTIF: "bg-green-100 text-green-700",
    NON_AKTIF: "bg-red-100 text-red-700",
    ALUMNI: "bg-slate-100 text-slate-600",
  };

  const genderLabel: Record<string, string> = {
    LAKI_LAKI: "Laki-laki",
    PEREMPUAN: "Perempuan",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Data Anggota</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola data seluruh anggota Karang Taruna
          </p>
        </div>
        <Link
          href="/dashboard/anggota/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Anggota
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-slate-400 font-semibold">Total</p>
          <p className="text-2xl font-extrabold text-slate-900">{anggotaList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-green-600 font-semibold">Aktif</p>
          <p className="text-2xl font-extrabold text-green-600">{totalAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-red-500 font-semibold">Non-Aktif</p>
          <p className="text-2xl font-extrabold text-red-500">{totalNonAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-slate-500 font-semibold">Alumni</p>
          <p className="text-2xl font-extrabold text-slate-500">{totalAlumni}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Anggota</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">NIK</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Jenis Kelamin</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Kontak</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider py-3 px-4">Tanggal Gabung</th>
              </tr>
            </thead>
            <tbody>
              {anggotaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Belum ada data anggota</p>
                  </td>
                </tr>
              ) : (
                anggotaList.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {a.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.namaLengkap}</p>
                          <p className="text-xs text-slate-400">{a.pekerjaan || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600 font-mono">{a.nik}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">{genderLabel[a.jenisKelamin] || a.jenisKelamin}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        {a.noHp && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {a.noHp}
                          </span>
                        )}
                        {a.email && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {a.email}
                          </span>
                        )}
                        {!a.noHp && !a.email && <span className="text-xs text-slate-300">-</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">
                      {formatDate(a.tanggalGabung)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
