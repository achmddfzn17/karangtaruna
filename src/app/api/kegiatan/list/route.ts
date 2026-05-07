import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kegiatan = await prisma.kegiatan.findMany({
    orderBy: [
      // ONGOING dulu, lalu UPCOMING, lalu yang lain
      { status: "asc" },
      { tanggalMulai: "desc" },
    ],
    select: {
      id: true,
      nama: true,
      status: true,
      tanggalMulai: true,
    },
    take: 50,
  });

  // Sort manual: ONGOING → UPCOMING → SELESAI → DIBATALKAN
  const order = ["ONGOING", "UPCOMING", "SELESAI", "DIBATALKAN"];
  const sorted = kegiatan.sort(
    (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
  );

  return NextResponse.json(sorted);
}
