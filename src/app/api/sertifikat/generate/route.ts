import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificatePDFDataUrl } from "@/lib/certificate-pdf";
import { sendCertificateEmail } from "@/lib/email";
import { Prisma } from "@prisma/client";

/**
 * POST /api/sertifikat/generate
 * Generate certificate for completed activity
 * Only ADMIN/SUPER_ADMIN can generate certificates
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - login diperlukan" }, { status: 401 });
    }

    // SECURITY: Only ADMIN/SUPER_ADMIN can generate certificates (proper typing)
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - hanya admin yang bisa membuat sertifikat" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { anggotaKegiatanId } = body;

    if (!anggotaKegiatanId) {
      return NextResponse.json(
        { error: "anggotaKegiatanId is required" },
        { status: 400 }
      );
    }

    // SECURITY: Validate anggotaKegiatanId format
    if (typeof anggotaKegiatanId !== "string" || anggotaKegiatanId.length === 0) {
      return NextResponse.json(
        { error: "Invalid anggotaKegiatanId format" },
        { status: 400 }
      );
    }

    // Get anggota kegiatan data
    const anggotaKegiatan = await prisma.anggotaKegiatan.findUnique({
      where: { id: anggotaKegiatanId },
      include: {
        anggota: true,
        kegiatan: true,
      },
    });

    if (!anggotaKegiatan) {
      return NextResponse.json(
        { error: "Data pendaftaran kegiatan tidak ditemukan" },
        { status: 404 }
      );
    }

    // SECURITY: Verify anggota kegiatan is marked as attended
    if (!anggotaKegiatan.hadir) {
      return NextResponse.json(
        { error: "Anggota harus hadir untuk mendapatkan sertifikat" },
        { status: 400 }
      );
    }

    // Generate certificate number with UUID to prevent race conditions
    // Format: CERT-YEAR-UUID (first 8 chars)
    const year = new Date().getFullYear();
    const uniqueId = crypto.randomUUID().slice(0, 8).toUpperCase();
    const nomorSertifikat = `CERT-${year}-${uniqueId}`;

    // Generate QR Code URL pointing to certificate verification endpoint
    const certificateQRData = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${nomorSertifikat}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      certificateQRData
    )}`;

    // Generate PDF (optional - can be async)
    let pdfUrl: string | null = null;
    try {
      const pdfDataUrl = await generateCertificatePDFDataUrl({
        nomorSertifikat,
        namaAnggota: anggotaKegiatan.anggota.namaLengkap,
        namaKegiatan: anggotaKegiatan.kegiatan.nama,
        tanggalKegiatan: anggotaKegiatan.kegiatan.tanggalMulai,
        qrCodeUrl,
      });
      pdfUrl = pdfDataUrl;
    } catch (error) {
      console.error("[PDF_GENERATION_ERROR]", error);
      // Continue without PDF if generation fails
    }

    // RACE CONDITION FIX: Use try-catch on create instead of find-then-create
    // This relies on the unique constraint on anggotaKegiatanId
    let certificate;
    try {
      certificate = await prisma.sertifikat.create({
        data: {
          anggotaKegiatanId,
          nomorSertifikat,
          namaAnggota: anggotaKegiatan.anggota.namaLengkap,
          namaKegiatan: anggotaKegiatan.kegiatan.nama,
          tanggalKegiatan: anggotaKegiatan.kegiatan.tanggalMulai,
          qrCode: qrCodeUrl,
          pdfUrl,
        },
      });
    } catch (error) {
      // Handle unique constraint violation (race condition)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation - certificate already exists
          const existingCert = await prisma.sertifikat.findUnique({
            where: { anggotaKegiatanId },
          });
          return NextResponse.json(
            {
              error: "Sertifikat sudah dibuat sebelumnya",
              certificate: existingCert,
            },
            { status: 400 }
          );
        }
      }
      throw error;
    }

    // Send email notification (async - don't wait for it)
    const anggotaEmail = anggotaKegiatan.anggota.email || anggotaKegiatan.anggota.noHp;
    if (anggotaEmail && anggotaEmail.includes("@")) {
      sendCertificateEmail(
        anggotaEmail,
        anggotaKegiatan.anggota.namaLengkap,
        nomorSertifikat,
        anggotaKegiatan.kegiatan.nama,
        qrCodeUrl,
        pdfUrl || undefined
      ).catch((error) => {
        console.error("[CERTIFICATE_EMAIL_ERROR]", error);
        // Don't fail certificate generation if email fails
      });
    }

    return NextResponse.json({
      success: true,
      certificate,
      message: "Sertifikat berhasil dibuat",
    });
  } catch (error) {
    console.error("[GENERATE_CERTIFICATE_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal membuat sertifikat" },
      { status: 500 }
    );
  }
}
