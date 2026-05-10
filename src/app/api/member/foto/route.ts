import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "galeri";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ANGGOTA") {
      return NextResponse.json({ error: "Forbidden - hanya anggota yang bisa upload foto" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const anggotaId = formData.get("anggotaId") as string;

    if (!file || !anggotaId) {
      return NextResponse.json({ error: "File dan anggotaId wajib diisi" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    // SECURITY: Verify anggota belongs to this user
    const anggota = await prisma.anggota.findUnique({
      where: { id: anggotaId, userId: session.user.id },
      select: { id: true, foto: true },
    });

    if (!anggota) {
      return NextResponse.json({ error: "Data anggota tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    // Delete old photo if exists
    let oldFileDeleted = true;
    if (anggota.foto) {
      try {
        const oldPath = anggota.foto.split("/").slice(-2).join("/"); // e.g. "foto-profil/xxx.jpg"
        const { error: deleteError } = await supabaseAdmin.storage
          .from(BUCKET)
          .remove([oldPath]);
        
        if (deleteError) {
          console.warn("[FOTO_DELETE_WARNING] Failed to delete old photo:", deleteError);
          oldFileDeleted = false;
          // Don't fail - continue with upload
        }
      } catch (error) {
        console.error("[FOTO_DELETE_ERROR]", error);
        oldFileDeleted = false;
      }
    }

    // Upload new photo
    const ext = file.type.split("/")[1];
    const path = `foto-profil/${anggotaId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[FOTO_UPLOAD_ERROR]", uploadError);
      return NextResponse.json({ error: "Gagal mengupload foto" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // SECURITY: Update anggota.foto in transaction-like manner
    try {
      await prisma.anggota.update({
        where: { id: anggotaId },
        data: { foto: publicUrl },
      });
    } catch (error) {
      console.error("[FOTO_UPDATE_DB_ERROR]", error);
      // If DB update fails, we need to clean up the uploaded file
      try {
        await supabaseAdmin.storage.from(BUCKET).remove([path]);
      } catch (cleanupError) {
        console.error("[FOTO_CLEANUP_ERROR] Failed to clean up uploaded file:", cleanupError);
      }
      return NextResponse.json({ error: "Gagal menyimpan data foto" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      oldFileDeleted, // Include flag for debugging
    });
  } catch (error) {
    console.error("[FOTO_UPLOAD_EXCEPTION]", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat upload foto" }, { status: 500 });
  }
}
