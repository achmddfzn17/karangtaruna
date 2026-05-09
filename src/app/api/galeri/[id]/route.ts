import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteFileFromStorage } from "@/lib/supabase";

/**
 * DELETE /api/galeri/[id]
 * Delete gallery item (admin only)
 * Also deletes the associated file from Supabase Storage
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  // SECURITY: Only ADMIN/SUPER_ADMIN can delete gallery items
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden - hanya admin yang bisa menghapus galeri" }, { status: 403 });
  }

  const { id } = await params;

  // SECURITY: Validate ID format
  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
  }

  try {
    // Get gallery item
    const item = await prisma.galeriItem.findUnique({ 
      where: { id },
      select: { id: true, url: true, judul: true }
    });
    
    if (!item) {
      return NextResponse.json({ error: "Item galeri tidak ditemukan" }, { status: 404 });
    }

    // Delete file from Supabase Storage
    let storageDeleted = true;
    if (item.url) {
      try {
        storageDeleted = await deleteFileFromStorage(item.url);
        if (!storageDeleted) {
          console.warn(`[DELETE_GALERI] Failed to delete file from storage: ${item.url}`);
          // Don't fail - continue with DB deletion
        }
      } catch (storageError) {
        console.error("[DELETE_GALERI_STORAGE_ERROR]", storageError);
        // Don't fail - continue with DB deletion
      }
    }

    // Delete data from database
    await prisma.galeriItem.delete({ where: { id } });
    
    return NextResponse.json({ 
      success: true,
      message: `Galeri "${item.judul}" berhasil dihapus`,
      storageDeleted,
    });
  } catch (error) {
    console.error("[DELETE_GALERI_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus galeri" }, { status: 500 });
  }
}
