import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Cek apakah masih ada transaksi yang pakai kategori ini
    const count = await prisma.transaksiKeuangan.count({ where: { kategoriId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Kategori masih digunakan oleh ${count} transaksi` },
        { status: 400 }
      );
    }

    await prisma.kategoriTransaksi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
