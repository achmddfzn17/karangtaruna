/**
 * Script untuk hapus file orphan di Supabase Storage
 * (file yang tidak ada referensinya di database)
 * 
 * Usage:
 * npx tsx scripts/cleanup-orphaned-files.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { supabaseAdmin, STORAGE_BUCKET, extractPathFromUrl } from "../src/lib/supabase";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL tidak ditemukan di .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanupOrphanedFiles() {
  console.log("🔍 Mencari file orphan di Supabase Storage...\n");

  try {
    // 1. Get all files from Supabase Storage
    console.log("📦 Mengambil daftar file dari Supabase Storage...");
    const { data: files, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list();

    if (error) {
      console.error("❌ Error mengambil file dari Supabase:", error);
      return;
    }

    if (!files || files.length === 0) {
      console.log("✅ Tidak ada file di Supabase Storage");
      return;
    }

    console.log(`   ✅ Ditemukan ${files.length} file di Supabase Storage\n`);

    // 2. Get all URLs from database
    console.log("🗄️  Mengambil daftar URL dari database...");
    
    const [anggota, berita, artikel, kegiatan, program, galeri] = await Promise.all([
      prisma.anggota.findMany({ select: { foto: true } }),
      prisma.berita.findMany({ select: { thumbnail: true } }),
      prisma.artikel.findMany({ select: { thumbnail: true } }),
      prisma.kegiatan.findMany({ select: { thumbnail: true } }),
      prisma.program.findMany({ select: { thumbnail: true } }),
      prisma.galeriItem.findMany({ select: { url: true } }),
    ]);

    // Collect all URLs
    const usedUrls = new Set<string>();
    
    anggota.forEach(a => a.foto && usedUrls.add(a.foto));
    berita.forEach(b => b.thumbnail && usedUrls.add(b.thumbnail));
    artikel.forEach(a => a.thumbnail && usedUrls.add(a.thumbnail));
    kegiatan.forEach(k => k.thumbnail && usedUrls.add(k.thumbnail));
    program.forEach(p => p.thumbnail && usedUrls.add(p.thumbnail));
    galeri.forEach(g => usedUrls.add(g.url));

    console.log(`   ✅ Ditemukan ${usedUrls.size} URL yang digunakan di database\n`);

    // 3. Extract paths from URLs
    const usedPaths = new Set<string>();
    usedUrls.forEach(url => {
      const path = extractPathFromUrl(url);
      if (path) usedPaths.add(path);
    });

    // 4. Find orphaned files
    const orphanedFiles: string[] = [];
    
    files.forEach(file => {
      if (!file.name) return;
      
      // Check if file is used in database
      if (!usedPaths.has(file.name)) {
        orphanedFiles.push(file.name);
      }
    });

    if (orphanedFiles.length === 0) {
      console.log("✅ Tidak ada file orphan ditemukan!");
      console.log("   Semua file di Supabase Storage masih digunakan di database");
      return;
    }

    console.log(`⚠️  Ditemukan ${orphanedFiles.length} file orphan:\n`);
    orphanedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    // 5. Konfirmasi
    console.log("\n⚠️  PERINGATAN: File-file ini akan dihapus dari Supabase Storage!");
    console.log("⏳ Menunggu 5 detik... (Ctrl+C untuk cancel)");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 6. Delete orphaned files
    console.log("\n🗑️  Menghapus file orphan...\n");
    
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(orphanedFiles);

    if (deleteError) {
      console.error("❌ Error menghapus file:", deleteError);
      return;
    }

    console.log(`✅ CLEANUP SELESAI!`);
    console.log(`   ${orphanedFiles.length} file orphan berhasil dihapus dari Supabase Storage`);

    // 7. Show storage stats
    const remainingFiles = files.length - orphanedFiles.length;
    console.log(`\n📊 Storage Statistics:`);
    console.log(`   Total file sebelumnya: ${files.length}`);
    console.log(`   File dihapus: ${orphanedFiles.length}`);
    console.log(`   File tersisa: ${remainingFiles}`);

  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Main
console.log("🧹 CLEANUP ORPHANED FILES\n");
console.log("Script ini akan mencari dan menghapus file di Supabase Storage");
console.log("yang tidak ada referensinya di database.\n");

cleanupOrphanedFiles();
