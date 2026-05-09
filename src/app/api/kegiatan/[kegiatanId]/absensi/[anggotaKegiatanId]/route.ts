import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * PATCH /api/kegiatan/[kegiatanId]/absensi/[anggotaKegiatanId]
 * Mark attendance for participant
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ kegiatanId: string; anggotaKegiatanId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { kegiatanId, anggotaKegiatanId } = await params;
    const body = await req.json();
    const { hadir } = body;

    if (typeof hadir !== "boolean") {
      return NextResponse.json(
        { error: "Field 'hadir' harus boolean" },
        { status: 400 }
      );
    }

    // Verify kegiatan exists
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
    });
    if (!kegiatan) {
      return NextResponse.json(
        { error: "Kegiatan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify attendance record exists
    const anggotaKegiatan = await prisma.anggotaKegiatan.findUnique({
      where: { id: anggotaKegiatanId },
      include: {
        anggota: { select: { namaLengkap: true } },
        kegiatan: { select: { nama: true } },
      },
    });

    if (!anggotaKegiatan) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify belongs to correct kegiatan
    if (anggotaKegiatan.kegiatanId !== kegiatanId) {
      return NextResponse.json({ error: "Data tidak sesuai" }, { status: 400 });
    }

    // Update attendance
    const updated = await prisma.anggotaKegiatan.update({
      where: { id: anggotaKegiatanId },
      data: { hadir },
      include: {
        anggota: { select: { namaLengkap: true } },
        sertifikat: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `${updated.anggota.namaLengkap} - Status: ${hadir ? "Hadir" : "Tidak Hadir"}`,
    });
  } catch (error) {
    console.error("[UPDATE_ABSENSI_ERROR]", error);
    return NextResponse.json({ error: "Gagal memperbarui absensi" }, { status: 500 });
  }
}
