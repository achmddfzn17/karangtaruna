/**
 * Script untuk membuat bucket Supabase Storage
 * Jalankan: npx tsx scripts/setup-storage.ts
 * 
 * Butuh SUPABASE_SERVICE_ROLE_KEY di .env
 * Ambil dari: https://supabase.com/dashboard/project/csacgdbuckmrhudtoejz/settings/api
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey || serviceRoleKey === "your-service-role-key-here") {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY belum diisi di .env");
  console.error("   Ambil dari: https://supabase.com/dashboard/project/csacgdbuckmrhudtoejz/settings/api");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log("🔧 Setup Supabase Storage...\n");

  // Cek apakah bucket sudah ada
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("❌ Gagal list buckets:", listError.message);
    process.exit(1);
  }

  const exists = buckets?.some((b) => b.name === "galeri");

  if (exists) {
    console.log("✅ Bucket 'galeri' sudah ada");
  } else {
    // Buat bucket
    const { error: createError } = await supabase.storage.createBucket("galeri", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm", "video/quicktime",
      ],
    });

    if (createError) {
      console.error("❌ Gagal membuat bucket:", createError.message);
      process.exit(1);
    }
    console.log("✅ Bucket 'galeri' berhasil dibuat (public)");
  }

  console.log("\n✅ Setup selesai! Galeri upload siap digunakan.");
}

setup().catch(console.error);
