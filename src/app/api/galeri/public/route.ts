import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.galeriItem.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      judul: true,
      url: true,
      type: true,
      deskripsi: true,
      createdAt: true,
      kegiatan: { select: { nama: true } },
    },
  });

  return NextResponse.json(items);
}
