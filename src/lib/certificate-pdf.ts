import jsPDF from "jspdf";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export interface CertificateData {
  nomorSertifikat: string;
  namaAnggota: string;
  namaKegiatan: string;
  tanggalKegiatan: Date;
  qrCodeUrl?: string;
  logoUrl?: string; // Organization logo
  watermarkText?: string; // Watermark text (default: "KARANG TARUNA")
  watermarkOpacity?: number; // 0-1, default: 0.08
  organizationName?: string; // Default: "GENERASI EMAS"
  signedBy?: string; // Default: "Admin Generasi Emas"
  approvedBy?: string; // Default: "Ketua Pengurus"
}

/**
 * Add watermark text to PDF background
 */
function addWatermark(
  doc: jsPDF,
  text: string,
  opacity: number = 0.08
): void {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Save graphics state
  doc.saveGraphicsState?.();

  // Set watermark style
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);

  // Set opacity for watermark
  if (doc.setGState) {
    doc.setGState(doc.GState({ opacity }));
  }

  // Add watermark text multiple times in background (simulating diagonal watermark)
  // Center position
  const x = width / 2;
  const y = height / 2;

  doc.text(text, x, y, { align: "center", maxWidth: width * 0.8 });

  // Reset opacity
  if (doc.setGState) {
    doc.setGState(doc.GState({ opacity: 1 }));
  }

  // Restore graphics state
  doc.restoreGraphicsState?.();

  // Reset text color
  doc.setTextColor(0, 0, 0);
}

export async function generateCertificatePDF(
  certificateData: CertificateData
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background color
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Add watermark
  try {
    addWatermark(
      doc,
      certificateData.watermarkText || "KARANG TARUNA",
      certificateData.watermarkOpacity ?? 0.08
    );
  } catch (error) {
    console.warn("Failed to add watermark:", error);
  }

  // Add logo if available
  if (certificateData.logoUrl) {
    try {
      const logoResponse = await fetch(certificateData.logoUrl);
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString("base64");
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;
      doc.addImage(logoDataUrl, "PNG", width / 2 - 8, 8, 16, 16);
    } catch (error) {
      console.warn("Failed to add logo:", error);
    }
  }

  // Decorative border
  doc.setDrawColor(59, 130, 246); // Blue
  doc.setLineWidth(2);
  doc.rect(10, 10, width - 20, height - 20);

  // Inner decorative line
  doc.setLineWidth(0.5);
  doc.rect(12, 12, width - 24, height - 24);

  // Header decoration
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, width, 30, "F");

  // Organization name (header)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(certificateData.organizationName || "GENERASI EMAS", width / 2, 20, { align: "center" });

  // Title
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("SERTIFIKAT", width / 2, 55, { align: "center" });

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.text("Penghargaan atas Partisipasi dan Dedikasi", width / 2, 65, { align: "center" });

  // Main text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Dengan hormat diberikan kepada:", width / 2, 85, { align: "center" });

  // Recipient name (large and bold)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(certificateData.namaAnggota, width / 2, 105, { align: "center" });

  // Certificate text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text("Atas penyelesaian dan partisipasi aktif dalam kegiatan:", width / 2, 125, {
    align: "center",
  });

  // Activity name (bold)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(certificateData.namaKegiatan, width / 2, 135, { align: "center" });

  // Date info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const formattedDate = format(new Date(certificateData.tanggalKegiatan), "dd MMMM yyyy", {
    locale: idLocale,
  });
  doc.text(`Tanggal Kegiatan: ${formattedDate}`, width / 2, 150, { align: "center" });

  // Certificate number
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`Nomor Sertifikat: ${certificateData.nomorSertifikat}`, width / 2, 160, {
    align: "center",
  });

  // QR Code if available
  if (certificateData.qrCodeUrl) {
    try {
      // Fetch QR code image
      const qrResponse = await fetch(certificateData.qrCodeUrl);
      const qrBuffer = await qrResponse.arrayBuffer();
      const qrBase64 = Buffer.from(qrBuffer).toString("base64");
      const qrDataUrl = `data:image/png;base64,${qrBase64}`;

      doc.addImage(qrDataUrl, "PNG", width / 2 - 15, 168, 30, 30);
    } catch (error) {
      console.warn("Failed to add QR code to PDF:", error);
    }
  }

  // Signature lines
  const signatureY = 210;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Left signature
  doc.text(`Diterbitkan oleh:`, 20, signatureY);
  doc.line(20, signatureY + 2, 50, signatureY + 2);
  doc.text(certificateData.signedBy || "Admin Generasi Emas", 20, signatureY + 12, { align: "center" });

  // Date issued right
  const dateIssued = format(new Date(), "dd MMMM yyyy", { locale: idLocale });
  doc.text(`Jakarta, ${dateIssued}`, width - 20, signatureY, {
    align: "right",
  });
  doc.line(width - 50, signatureY + 2, width - 20, signatureY + 2);
  doc.text(certificateData.approvedBy || "Ketua Pengurus", width - 35, signatureY + 12, { align: "center" });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Sertifikat ini adalah bukti resmi partisipasi dalam kegiatan. Verifikasi dapat dilakukan melalui QR code di atas.",
    width / 2,
    height - 10,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * Generate certificate PDF and return as base64 data URL
 */
export async function generateCertificatePDFDataUrl(
  certificateData: CertificateData
): Promise<string> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background color
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, "F");

  // Add watermark
  try {
    addWatermark(
      doc,
      certificateData.watermarkText || "KARANG TARUNA",
      certificateData.watermarkOpacity ?? 0.08
    );
  } catch (error) {
    console.warn("Failed to add watermark:", error);
  }

  // Add logo if available
  if (certificateData.logoUrl) {
    try {
      const logoResponse = await fetch(certificateData.logoUrl);
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString("base64");
      const logoDataUrl = `data:image/png;base64,${logoBase64}`;
      doc.addImage(logoDataUrl, "PNG", width / 2 - 8, 8, 16, 16);
    } catch (error) {
      console.warn("Failed to add logo:", error);
    }
  }

  // Decorative border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setLineWidth(0.5);
  doc.rect(12, 12, width - 24, height - 24);

  // Header decoration
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, width, 30, "F");

  // Organization name (header)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(certificateData.organizationName || "GENERASI EMAS", width / 2, 20, { align: "center" });

  // Title
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("SERTIFIKAT", width / 2, 55, { align: "center" });

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.text("Penghargaan atas Partisipasi dan Dedikasi", width / 2, 65, { align: "center" });

  // Main text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Dengan hormat diberikan kepada:", width / 2, 85, { align: "center" });

  // Recipient name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(certificateData.namaAnggota, width / 2, 105, { align: "center" });

  // Certificate text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Atas penyelesaian dan partisipasi aktif dalam kegiatan:", width / 2, 125, {
    align: "center",
  });

  // Activity name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(certificateData.namaKegiatan, width / 2, 135, { align: "center" });

  // Date info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const formattedDate = format(new Date(certificateData.tanggalKegiatan), "dd MMMM yyyy", {
    locale: idLocale,
  });
  doc.text(`Tanggal Kegiatan: ${formattedDate}`, width / 2, 150, { align: "center" });

  // Certificate number
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(`Nomor Sertifikat: ${certificateData.nomorSertifikat}`, width / 2, 160, {
    align: "center",
  });

  // QR Code if available
  if (certificateData.qrCodeUrl) {
    try {
      const qrResponse = await fetch(certificateData.qrCodeUrl);
      const qrBuffer = await qrResponse.arrayBuffer();
      const qrBase64 = Buffer.from(qrBuffer).toString("base64");
      const qrDataUrl = `data:image/png;base64,${qrBase64}`;

      doc.addImage(qrDataUrl, "PNG", width / 2 - 15, 168, 30, 30);
    } catch (error) {
      console.warn("Failed to add QR code to PDF:", error);
    }
  }

  // Signature lines
  const signatureY = 210;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Diterbitkan oleh:`, 20, signatureY);
  doc.line(20, signatureY + 2, 50, signatureY + 2);
  doc.text(certificateData.signedBy || "Admin Generasi Emas", 20, signatureY + 12, { align: "center" });

  const dateIssued = format(new Date(), "dd MMMM yyyy", { locale: idLocale });
  doc.text(`Jakarta, ${dateIssued}`, width - 20, signatureY, {
    align: "right",
  });
  doc.line(width - 50, signatureY + 2, width - 20, signatureY + 2);
  doc.text(certificateData.approvedBy || "Ketua Pengurus", width - 35, signatureY + 12, { align: "center" });

  // Footer note
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Sertifikat ini adalah bukti resmi partisipasi dalam kegiatan.",
    width / 2,
    height - 10,
    { align: "center" }
  );

  return doc.output("dataurlstring") as string;
}
