import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi ukuran
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 50MB" },
        { status: 400 }
      );
    }

    // Validasi tipe
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, MP4, WebM, atau MOV." },
        { status: 400 }
      );
    }

    // Tentukan folder berdasarkan tipe
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const folder = isVideo ? "videos" : "photos";

    // Generate nama file unik
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${random}.${ext}`;

    // Upload ke Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      // Pesan error yang lebih informatif
      let userMessage = "Gagal mengupload file";
      if (uploadError.message.includes("Bucket not found")) {
        userMessage =
          'Bucket storage "galeri" belum dibuat. Buka Supabase Dashboard → Storage → New bucket → nama: galeri → centang Public → Save.';
      } else if (uploadError.message.includes("Invalid")) {
        userMessage = "Konfigurasi Supabase tidak valid. Periksa NEXT_PUBLIC_SUPABASE_ANON_KEY di .env";
      } else {
        userMessage = uploadError.message;
      }

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    // Ambil public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
      type: isVideo ? "VIDEO" : "FOTO",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
