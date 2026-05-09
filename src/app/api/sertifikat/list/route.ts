import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/sertifikat/list
 * Get all certificates
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { namaAnggota: { contains: search, mode: "insensitive" as const } },
            { namaKegiatan: { contains: search, mode: "insensitive" as const } },
            { nomorSertifikat: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [sertifikat, total] = await Promise.all([
      prisma.sertifikat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          anggotaKegiatan: {
            include: {
              anggota: { select: { namaLengkap: true } },
              kegiatan: { select: { nama: true } },
            },
          },
        },
      }),
      prisma.sertifikat.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sertifikat,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[LIST_SERTIFIKAT_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sertifikat" },
      { status: 500 }
    );
  }
}
