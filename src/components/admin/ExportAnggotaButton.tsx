"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Anggota, JenisKelamin, StatusAnggota } from "@prisma/client";

interface ExportAnggotaButtonProps {
  data: (Anggota & { user: { id: string; email: string } | null })[];
}

export function ExportAnggotaButton({ data }: ExportAnggotaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatDataForExport = () => {
    return data.map((a, index: number) => ({
      No: index + 1,
      NIK: a.nik,
      "Nama Lengkap": a.namaLengkap,
      "Jenis Kelamin": a.jenisKelamin === JenisKelamin.LAKI_LAKI ? "Laki-laki" : "Perempuan",
      "No HP": a.noHp || "-",
      Email: a.email || "-",
      Pekerjaan: a.pekerjaan || "-",
      Status: a.status.replace("_", " "),
      "Tanggal Gabung": new Date(a.tanggalGabung).toLocaleDateString("id-ID"),
    }));
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const formattedData = formatDataForExport();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Anggota");
      XLSX.writeFile(workbook, `Data_Anggota_Karang_Taruna_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error("Gagal export Excel:", error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF("landscape");
      
      doc.setFontSize(16);
      doc.text("Laporan Data Anggota Karang Taruna", 14, 15);
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);

      const formattedData = formatDataForExport();
      const tableColumn = Object.keys(formattedData[0]);
      const tableRows = formattedData.map(obj => Object.values(obj));

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`Data_Anggota_Karang_Taruna_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Gagal export PDF:", error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export Laporan
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
            <button
              onClick={exportToExcel}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Export ke Excel
            </button>
            <button
              onClick={exportToPDF}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-600" />
              Export ke PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
