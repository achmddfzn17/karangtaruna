"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

import { TransaksiKeuangan, JenisTransaksi } from "@prisma/client";

interface TransaksiWithKategori extends TransaksiKeuangan {
  kategori: { nama: string } | null;
}

interface Props {
  transaksi: TransaksiWithKategori[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldo: number;
}

export default function ExportKeuanganButton({
  transaksi,
  totalPemasukan,
  totalPengeluaran,
  saldo,
}: Props) {
  const [open, setOpen] = useState(false);

  const rows = transaksi.map((t, i) => ({
    no: i + 1,
    tanggal: new Date(t.tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    keterangan: t.keterangan,
    kategori: t.kategori?.nama || "Umum",
    jenis: t.jenis === JenisTransaksi.MASUK ? "Pemasukan" : "Pengeluaran",
    jumlah: t.jumlah,
    jumlahFmt: formatCurrency(t.jumlah),
  }));

  const exportExcel = () => {
    type ExcelRow = {
      No?: number | string;
      Tanggal?: string;
      Keterangan?: string;
      Kategori?: string;
      Jenis?: string;
      "Jumlah (Rp)"?: number | string;
    };

    const data: ExcelRow[] = rows.map((r) => ({
      No: r.no,
      Tanggal: r.tanggal,
      Keterangan: r.keterangan,
      Kategori: r.kategori,
      Jenis: r.jenis,
      "Jumlah (Rp)": r.jumlah,
    }));

    // Tambah baris ringkasan
    data.push({});
    data.push({ No: "", Tanggal: "RINGKASAN", Keterangan: "", Kategori: "", Jenis: "", "Jumlah (Rp)": "" });
    data.push({ No: "", Tanggal: "Total Pemasukan", Keterangan: "", Kategori: "", Jenis: "", "Jumlah (Rp)": totalPemasukan });
    data.push({ No: "", Tanggal: "Total Pengeluaran", Keterangan: "", Kategori: "", Jenis: "", "Jumlah (Rp)": totalPengeluaran });
    data.push({ No: "", Tanggal: "Saldo Akhir", Keterangan: "", Kategori: "", Jenis: "", "Jumlah (Rp)": saldo });

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");
    XLSX.writeFile(wb, `Laporan_Keuangan_${Date.now()}.xlsx`);
    toast.success("Export Excel berhasil!");
    setOpen(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN KEUANGAN", doc.internal.pageSize.width / 2, 18, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Karang Taruna Generasi Emas", doc.internal.pageSize.width / 2, 25, { align: "center" });
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      doc.internal.pageSize.width / 2,
      31,
      { align: "center" }
    );

    // Tabel transaksi
    autoTable(doc, {
      startY: 38,
      head: [["No", "Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah (Rp)"]],
      body: rows.map((r) => [r.no, r.tanggal, r.keterangan, r.kategori, r.jenis, r.jumlahFmt]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        4: { halign: "center" },
        5: { halign: "right" },
      },
    });

    // Ringkasan
    interface AutoTableDoc extends jsPDF {
      lastAutoTable?: { finalY: number };
    }
    const finalY = ((doc as unknown) as AutoTableDoc).lastAutoTable?.finalY ?? 60;
    autoTable(doc, {
      startY: finalY,
      head: [["Ringkasan", "Jumlah"]],
      body: [
        ["Total Pemasukan", formatCurrency(totalPemasukan)],
        ["Total Pengeluaran", formatCurrency(totalPengeluaran)],
        ["Saldo Akhir", formatCurrency(saldo)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
      tableWidth: 100,
      margin: { left: doc.internal.pageSize.width - 110 },
    });

    doc.save(`Laporan_Keuangan_${Date.now()}.pdf`);
    toast.success("Export PDF berhasil!");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
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
