"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface AdminData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date | string;
  admin?: {
    nip: string | null;
    jabatan: string | null;
    phone: string | null;
  } | null;
}

interface Props {
  data: AdminData[];
}

export default function ExportAdminButton({ data }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatData = () => {
    return data.map((admin, index) => ({
      No: index + 1,
      Nama: admin.name || "-",
      Email: admin.email,
      Role: admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin",
      NIP: admin.admin?.nip || "-",
      Jabatan: admin.admin?.jabatan || "-",
      "No. HP": admin.admin?.phone || "-",
      "Terdaftar": new Date(admin.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }));
  };

  const exportExcel = () => {
    setLoading(true);
    try {
      const formatted = formatData();
      const ws = XLSX.utils.json_to_sheet(formatted);
      
      // Set column widths
      ws["!cols"] = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama
        { wch: 30 },  // Email
        { wch: 15 },  // Role
        { wch: 15 },  // NIP
        { wch: 20 },  // Jabatan
        { wch: 15 },  // No HP
        { wch: 20 },  // Terdaftar
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Admin");
      
      const filename = `Data_Admin_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast.success("Data admin berhasil diekspor ke Excel");
      setOpen(false);
    } catch (error) {
      console.error("[EXPORT_EXCEL_ERROR]", error);
      toast.error("Gagal mengekspor ke Excel");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF("landscape");

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Daftar Administrator", 14, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);
      doc.text(`Total Admin: ${data.length}`, 14, 27);

      const formatted = formatData();
      const tableColumns = Object.keys(formatted[0] || {});
      const tableRows = formatted.map((obj) => Object.values(obj));

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 32,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [37, 99, 235], // blue-600
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
      });

      // Footer dengan nomor halaman
      const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      const filename = `Data_Admin_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);

      toast.success("Data admin berhasil diekspor ke PDF");
      setOpen(false);
    } catch (error) {
      console.error("[EXPORT_PDF_ERROR]", error);
      toast.error("Gagal mengekspor ke PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={data.length === 0 || loading}
        className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Export data admin"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export Data
      </button>

      {open && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
            <button
              onClick={exportExcel}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Export ke Excel
            </button>
            <button
              onClick={exportPDF}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors border-t border-slate-100"
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
