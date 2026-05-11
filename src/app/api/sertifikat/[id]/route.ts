import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

/**
 * PATCH /api/sertifikat/[id]
 * Update certificate (regenerate QR code, update data)
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

    // Type-safe role check
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { regenerateQR } = body;

    const sertifikat = await prisma.sertifikat.findUnique({ where: { id } });
    if (!sertifikat) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan" },
        { status: 404 }
      );
    }

    // Type-safe update data
    const updateData: Prisma.SertifikatUpdateInput = {};

    if (regenerateQR) {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        sertifikat.nomorSertifikat
      )}`;
      updateData.qrCode = qrCodeUrl;
    }

    const updated = await prisma.sertifikat.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Sertifikat berhasil diperbarui",
    });
  } catch (error) {
    console.error("[UPDATE_SERTIFIKAT_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui sertifikat" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sertifikat/[id]
 * Delete certificate
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

    // Type-safe role check
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const sertifikat = await prisma.sertifikat.findUnique({ where: { id } });
    if (!sertifikat) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.sertifikat.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Sertifikat ${sertifikat.nomorSertifikat} berhasil dihapus`,
    });
  } catch (error) {
    console.error("[DELETE_SERTIFIKAT_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal menghapus sertifikat" },
      { status: 500 }
    );
  }
}
