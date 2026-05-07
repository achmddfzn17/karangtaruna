import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Cek session — hanya SUPER_ADMIN yang bisa hapus admin
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Hanya Super Admin yang bisa menghapus admin" }, { status: 403 });
  }

  // Tidak bisa hapus diri sendiri
  if ((session.user as any).id === id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: { admin: true, anggota: true }
    });
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    // Note: Admin biasanya tidak punya foto profil
    // Tapi jika ada anggota yang di-promote jadi admin, foto akan tetap ada
    // Cascade delete akan handle relasi admin dan anggota

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_ADMIN_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus admin" }, { status: 500 });
  }
}
