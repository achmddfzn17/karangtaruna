"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface Peserta {
  id: string;
  hadir: boolean;
  createdAt: Date;
  anggota: {
    namaLengkap: string;
    nik: string;
    noHp: string | null;
  };
}

interface Props {
  namaKegiatan: string;
  tanggal: string;
  peserta: Peserta[];
}

export default function ExportAbsensiButton({ namaKegiatan, tanggal, peserta }: Props) {
  const [open, setOpen] = useState(false);

  const rows = peserta.map((p, i) => ({
    no: i + 1,
    nama: p.anggota.namaLengkap,
    nik: p.anggota.nik,
    noHp: p.anggota.noHp || "-",
    hadir: p.hadir ? "Hadir" : "Tidak Hadir",
    tanda: p.hadir ? "✓" : "✗",
  }));

  const totalHadir = peserta.filter((p) => p.hadir).length;

  const exportExcel = () => {
    const data = rows.map((r) => ({
      No: r.no,
      "Nama Lengkap": r.nama,
      NIK: r.nik,
      "No. HP": r.noHp,
      Kehadiran: r.hadir,
    }));

    data.push({} as any);
    data.push({
      No: "" as any,
      "Nama Lengkap": `Total Hadir: ${totalHadir} / ${peserta.length}`,
      NIK: "",
      "No. HP": "",
      Kehadiran: "",
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Hadir");
    XLSX.writeFile(wb, `Absensi_${namaKegiatan.replace(/\s+/g, "_")}_${Date.now()}.xlsx`);
    toast.success("Export Excel berhasil!");
    setOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR HADIR KEGIATAN", doc.internal.pageSize.width / 2, 18, { align: "center" });
    doc.setFontSize(11);
    doc.text(namaKegiatan, doc.internal.pageSize.width / 2, 26, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal: ${tanggal}`, doc.internal.pageSize.width / 2, 33, { align: "center" });
    doc.text(
      `Total Hadir: ${totalHadir} dari ${peserta.length} peserta`,
      doc.internal.pageSize.width / 2,
      39,
      { align: "center" }
    );

    autoTable(doc, {
      startY: 45,
      head: [["No", "Nama Lengkap", "NIK", "No. HP", "Kehadiran", "Tanda Tangan"]],
      body: rows.map((r) => [r.no, r.nama, r.nik, r.noHp, r.hadir, ""]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        4: { halign: "center" },
        5: { cellWidth: 30 },
      },
    });

    doc.save(`Absensi_${namaKegiatan.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
    toast.success("Export PDF berhasil!");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={peserta.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        Export Absensi
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
            <button
              onClick={exportExcel}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>
            <button
              onClick={exportPDF}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
            >
              <FileText className="w-4 h-4 text-red-500" />
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
