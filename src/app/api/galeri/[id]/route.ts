import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteFileFromStorage } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const item = await prisma.galeriItem.findUnique({ 
      where: { id },
      select: { url: true }
    });
    
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Hapus file dari Supabase Storage
    await deleteFileFromStorage(item.url);

    // Hapus data dari database
    await prisma.galeriItem.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_GALERI_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
