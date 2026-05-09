import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * PATCH /api/iuran/[id]
 * Update iuran record
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await req.json();
    const { jumlah, tanggalBayar, keterangan } = body;

    // Validate input
    if (!jumlah || jumlah <= 0) {
      return NextResponse.json(
        { error: "Jumlah harus lebih dari 0" },
        { status: 400 }
      );
    }

    if (tanggalBayar && isNaN(Date.parse(tanggalBayar))) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    const iuran = await prisma.iuranAnggota.findUnique({ where: { id } });
    if (!iuran) {
      return NextResponse.json({ error: "Iuran tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.iuranAnggota.update({
      where: { id },
      data: {
        jumlah,
        tanggalBayar: tanggalBayar ? new Date(tanggalBayar) : iuran.tanggalBayar,
        keterangan: keterangan || iuran.keterangan,
      },
      include: { anggota: { select: { namaLengkap: true } } },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Iuran berhasil diperbarui",
    });
  } catch (error) {
    console.error("[UPDATE_IURAN_ERROR]", error);
    return NextResponse.json({ error: "Gagal memperbarui iuran" }, { status: 500 });
  }
}

/**
 * DELETE /api/iuran/[id]
 * Delete iuran record
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const iuran = await prisma.iuranAnggota.findUnique({
      where: { id },
      include: { anggota: { select: { namaLengkap: true } } },
    });

    if (!iuran) {
      return NextResponse.json({ error: "Iuran tidak ditemukan" }, { status: 404 });
    }

    await prisma.iuranAnggota.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Iuran ${iuran.anggota.namaLengkap} bulan ${iuran.bulan} tahun ${iuran.tahun} berhasil dihapus`,
    });
  } catch (error) {
    console.error("[DELETE_IURAN_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus iuran" }, { status: 500 });
  }
}
