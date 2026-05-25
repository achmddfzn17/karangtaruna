import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function safeFolderName(folder: FormDataEntryValue | null): string {
  const value = typeof folder === "string" ? folder : "thumbnails";
  const sanitized = value
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");

  return sanitized || "thumbnails";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden - hanya admin yang bisa upload thumbnail" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket");

    if (bucket && bucket !== STORAGE_BUCKET) {
      return NextResponse.json({ error: "Bucket tidak valid" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
    }

    const folder = safeFolderName(formData.get("folder"));
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[THUMBNAIL_UPLOAD_ERROR]", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("[THUMBNAIL_UPLOAD_EXCEPTION]", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupload thumbnail" }, { status: 500 });
  }
}
