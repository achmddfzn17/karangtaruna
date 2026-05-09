import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/**
 * POST /api/galeri/upload
 * Upload gallery media file to Supabase Storage
 * Only ADMIN/SUPER_ADMIN can upload
 */
export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  // SECURITY: Only ADMIN/SUPER_ADMIN can upload gallery content
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden - hanya admin yang bisa upload galeri" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB, file Anda ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format file tidak didukung. Gunakan: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(", ")}` },
        { status: 400 }
      );
    }

    // Determine folder based on type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const folder = isVideo ? "videos" : "photos";

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${random}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[UPLOAD_ERROR]", uploadError);

      // Provide more informative error messages
      let userMessage = "Gagal mengupload file ke storage";
      if (uploadError.message.includes("Bucket not found")) {
        userMessage =
          'Bucket storage "galeri" belum dibuat. Buka Supabase Dashboard → Storage → New bucket → nama: galeri → centang Public → Save.';
      } else if (uploadError.message.includes("Invalid")) {
        userMessage = "Konfigurasi Supabase tidak valid. Periksa environment variables di .env.local";
      } else if (uploadError.message.includes("Duplicate")) {
        userMessage = "File sudah ada. Silakan gunakan nama file berbeda.";
      } else {
        userMessage = uploadError.message;
      }

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      type: isVideo ? "VIDEO" : "FOTO",
      message: `File berhasil diupload ke ${folder}`,
    });
  } catch (error) {
    console.error("[GALERI_UPLOAD_EXCEPTION]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupload file" },
      { status: 500 }
    );
  }
}
