import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ✅ AUTH CHECK: Require SUPER_ADMIN role
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check role with proper typing
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ 
      error: "Hanya Super Admin yang bisa menghapus admin" 
    }, { status: 403 });
  }

  // ✅ CRITICAL: Tidak bisa hapus diri sendiri
  if (session.user.id === id) {
    return NextResponse.json({ 
      error: "Tidak bisa menghapus akun sendiri" 
    }, { status: 400 });
  }

  // ✅ Validate ID format
  if (!id || typeof id !== "string") {
    return NextResponse.json({ 
      error: "ID admin tidak valid" 
    }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, role: true, name: true, email: true },
    });
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    // ✅ CRITICAL: Cek jika target user adalah SUPER_ADMIN terakhir
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });

      if (superAdminCount <= 1) {
        return NextResponse.json({ 
          error: "Tidak bisa menghapus Super Admin terakhir. Sistem harus memiliki minimal 1 Super Admin." 
        }, { status: 400 });
      }
    }

    // Cascade delete akan handle relasi admin dan anggota
    await prisma.user.delete({ where: { id } });
    
    return NextResponse.json({ 
      success: true,
      message: `Admin "${user.name || user.email}" berhasil dihapus`,
    });
  } catch (error) {
    console.error("[DELETE_ADMIN_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus admin" }, { status: 500 });
  }
}
