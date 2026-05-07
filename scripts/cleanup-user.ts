/**
 * Script untuk hapus user dan semua data terkait termasuk file di Supabase Storage
 * 
 * Usage:
 * npx tsx scripts/cleanup-user.ts "nama@email.com"
 * atau
 * npx tsx scripts/cleanup-user.ts "Nama Lengkap"
 */

import "dotenv/config"; // Load .env file
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { deleteFileFromStorage } from "../src/lib/supabase";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL tidak ditemukan di .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanupUser(identifier: string) {
  console.log("🔍 Mencari user:", identifier);

  // Cari user berdasarkan email atau nama
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: identifier, mode: "insensitive" } },
        { name: { contains: identifier, mode: "insensitive" } },
      ],
    },
    include: {
      anggota: true,
      admin: true,
    },
  });

  if (!user) {
    console.log("❌ User tidak ditemukan");
    return;
  }

  console.log("\n📋 User ditemukan:");
  console.log("   ID:", user.id);
  console.log("   Nama:", user.name);
  console.log("   Email:", user.email);
  console.log("   Role:", user.role);

  // Konfirmasi
  console.log("\n⚠️  PERINGATAN: Ini akan menghapus:");
  console.log("   - Data user dari database");
  console.log("   - Data anggota (jika ada)");
  console.log("   - Data admin (jika ada)");
  console.log("   - Foto profil dari Supabase Storage");
  console.log("   - Semua data terkait (votes, aspirasi, notifikasi, dll)");

  // Tunggu 3 detik untuk cancel
  console.log("\n⏳ Menunggu 3 detik... (Ctrl+C untuk cancel)");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("\n🗑️  Memulai proses cleanup...\n");

  try {
    // 1. Hapus foto profil dari Supabase jika ada
    if (user.anggota?.foto) {
      console.log("📸 Menghapus foto profil dari Supabase...");
      const deleted = await deleteFileFromStorage(user.anggota.foto);
      if (deleted) {
        console.log("   ✅ Foto profil berhasil dihapus");
      } else {
        console.log("   ⚠️  Foto profil tidak ditemukan atau sudah dihapus");
      }
    }

    // 2. Hapus data anggota (cascade akan hapus relasi)
    if (user.anggota) {
      console.log("👤 Menghapus data anggota...");
      await prisma.anggota.delete({
        where: { id: user.anggota.id },
      });
      console.log("   ✅ Data anggota berhasil dihapus");
    }

    // 3. Hapus data admin (jika ada)
    if (user.admin) {
      console.log("👔 Menghapus data admin...");
      await prisma.admin.delete({
        where: { id: user.admin.id },
      });
      console.log("   ✅ Data admin berhasil dihapus");
    }

    // 4. Hapus user (cascade akan hapus votes, aspirasi, notifikasi, dll)
    console.log("🗑️  Menghapus user...");
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log("   ✅ User berhasil dihapus");

    console.log("\n✅ CLEANUP SELESAI!");
    console.log("   User dan semua data terkait berhasil dihapus dari database dan Supabase Storage");
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Main
const identifier = process.argv[2];

if (!identifier) {
  console.log("❌ Usage: npx tsx scripts/cleanup-user.ts <email atau nama>");
  console.log("\nContoh:");
  console.log('  npx tsx scripts/cleanup-user.ts "budi@example.com"');
  console.log('  npx tsx scripts/cleanup-user.ts "Budi Santoso"');
  process.exit(1);
}

cleanupUser(identifier);
