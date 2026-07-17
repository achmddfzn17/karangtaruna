import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * GET /api/calendar/events
 * Get all events for calendar view
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const parsedMonth = parseInt(searchParams.get("month") || "", 10);
    const parsedYear = parseInt(searchParams.get("year") || "", 10);

    // Fall back to the current month/year when params are missing or non-numeric,
    // otherwise NaN produces Invalid Date bounds and a Prisma 500.
    const month = Number.isNaN(parsedMonth) ? now.getMonth() + 1 : parsedMonth;
    const year = Number.isNaN(parsedYear) ? now.getFullYear() : parsedYear;

    // Get start and end date of the month.
    // endDate is the last day of the month at 23:59:59.999 so events on the last
    // day with a time component are included (lte with 00:00:00 would drop them).
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch kegiatan, berita, and artikel
    const [kegiatan, berita, artikel] = await Promise.all([
      prisma.kegiatan.findMany({
        where: {
          tanggalMulai: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          nama: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          jenis: true,
          status: true,
          lokasi: true,
        },
        orderBy: { tanggalMulai: "asc" },
      }),
      prisma.berita.findMany({
        where: {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
          status: "PUBLISHED",
        },
        select: {
          id: true,
          judul: true,
          publishedAt: true,
          slug: true,
        },
        orderBy: { publishedAt: "asc" },
      }),
      prisma.artikel.findMany({
        where: {
          publishedAt: {
            gte: startDate,
            lte: endDate,
          },
          status: "PUBLISHED",
        },
        select: {
          id: true,
          judul: true,
          publishedAt: true,
          slug: true,
        },
        orderBy: { publishedAt: "asc" },
      }),
    ]);

    // Format events for calendar
    const events = [
      ...kegiatan.map((k) => ({
        id: k.id,
        title: k.nama,
        type: "kegiatan",
        jenis: k.jenis,
        status: k.status,
        startDate: k.tanggalMulai,
        endDate: k.tanggalSelesai || k.tanggalMulai,
        lokasi: k.lokasi,
        color: getKegiatanColor(k.jenis),
      })),
      ...berita.map((b) => ({
        id: b.id,
        title: b.judul,
        type: "berita",
        startDate: b.publishedAt,
        endDate: b.publishedAt,
        color: "#ef4444",
      })),
      ...artikel.map((a) => ({
        id: a.id,
        title: a.judul,
        type: "artikel",
        startDate: a.publishedAt,
        endDate: a.publishedAt,
        color: "#8b5cf6",
      })),
    ];

    return NextResponse.json({
      success: true,
      month,
      year,
      events,
    });
  } catch (error) {
    console.error("[GET_CALENDAR_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kalender" },
      { status: 500 }
    );
  }
}

function getKegiatanColor(jenis: string): string {
  const colors: Record<string, string> = {
    SOSIAL: "#3b82f6",
    PENDIDIKAN: "#10b981",
    EKONOMI: "#f59e0b",
    OLAHRAGA: "#ec4899",
    SENI_BUDAYA: "#8b5cf6",
    LAINNYA: "#6b7280",
  };
  return colors[jenis] || "#6b7280";
}
