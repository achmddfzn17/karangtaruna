import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/kegiatan/list
 * Get list of all kegiatan (activities)
 * Sorted by status (ONGOING → UPCOMING → SELESAI → DIBATALKAN) then by date
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kegiatan = await prisma.kegiatan.findMany({
      orderBy: [
        { status: "asc" },
        { tanggalMulai: "desc" },
      ],
      select: {
        id: true,
        nama: true,
        status: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        lokasi: true,
      },
      take: 100, // Increased from 50 for better flexibility
    });

    // Sort manual: ONGOING → UPCOMING → SELESAI → DIBATALKAN
    const statusOrder = ["ONGOING", "UPCOMING", "SELESAI", "DIBATALKAN"];
    const sorted = kegiatan.sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    );

    return NextResponse.json({
      success: true,
      total: sorted.length,
      data: sorted,
    });
  } catch (error) {
    console.error("[KEGIATAN_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar kegiatan" },
      { status: 500 }
    );
  }
}
