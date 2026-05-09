import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY: Add authentication check - only ADMIN/SUPER_ADMIN can delete
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden - hanya admin yang bisa menghapus kategori" }, { status: 403 });
  }

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
  } catch (error) {
    console.error("[DELETE_KATEGORI_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
