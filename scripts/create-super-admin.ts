/**
 * Script untuk membuat Super Admin baru
 * Usage: npx tsx scripts/create-super-admin.ts
 * 
 * Default credentials (sesuai request):
 * - Name: achmddfzn
 * - Email: achmddfzn@gmail.com
 * - Password: password
 * - Role: SUPER_ADMIN
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load .env file
config({ path: ".env" });
config({ path: ".env.local" });

// Konfigurasi Super Admin yang akan dibuat
const SUPER_ADMIN_CONFIG = {
  name: "achmddfzn",
  email: "achmddfzn@gmail.com",
  password: "password", // Akan di-hash
  role: "SUPER_ADMIN" as const,
  jabatan: "Super Administrator",
  phone: null as string | null,
  nip: null as string | null,
};

// Setup Prisma dengan adapter (Prisma v7)
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL tidak ditemukan di environment variables");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function createSuperAdmin() {
  console.log("\n🚀 Memulai pembuatan Super Admin...\n");
  console.log("📋 Konfigurasi:");
  console.log(`   - Nama:     ${SUPER_ADMIN_CONFIG.name}`);
  console.log(`   - Email:    ${SUPER_ADMIN_CONFIG.email}`);
  console.log(`   - Password: ${SUPER_ADMIN_CONFIG.password} (akan di-hash)`);
  console.log(`   - Role:     ${SUPER_ADMIN_CONFIG.role}`);
  console.log(`   - Jabatan:  ${SUPER_ADMIN_CONFIG.jabatan}\n`);

  try {
    // Check apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_CONFIG.email },
      include: { admin: true },
    });

    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, 12);

    if (existingUser) {
      console.log("⚠️  User dengan email tersebut sudah ada!");
      console.log(`   - ID:    ${existingUser.id}`);
      console.log(`   - Name:  ${existingUser.name}`);
      console.log(`   - Role:  ${existingUser.role}\n`);

      console.log("🔄 Mengupdate data user menjadi SUPER_ADMIN...");

      await prisma.$transaction(async (tx) => {
        // Update user
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: SUPER_ADMIN_CONFIG.name,
            role: "SUPER_ADMIN",
            password: hashedPassword,
          },
        });

        // Upsert admin record
        await tx.admin.upsert({
          where: { userId: existingUser.id },
          create: {
            userId: existingUser.id,
            jabatan: SUPER_ADMIN_CONFIG.jabatan,
            phone: SUPER_ADMIN_CONFIG.phone,
            nip: SUPER_ADMIN_CONFIG.nip,
          },
          update: {
            jabatan: SUPER_ADMIN_CONFIG.jabatan,
          },
        });
      });

      console.log("✅ User berhasil diupdate menjadi SUPER_ADMIN!\n");
    } else {
      // Buat Super Admin baru dengan transaction
      console.log("🔨 Membuat Super Admin baru...");

      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: SUPER_ADMIN_CONFIG.name,
            email: SUPER_ADMIN_CONFIG.email,
            password: hashedPassword,
            role: SUPER_ADMIN_CONFIG.role,
          },
        });

        await tx.admin.create({
          data: {
            userId: user.id,
            jabatan: SUPER_ADMIN_CONFIG.jabatan,
            phone: SUPER_ADMIN_CONFIG.phone,
            nip: SUPER_ADMIN_CONFIG.nip,
          },
        });

        return user;
      });

      console.log("✅ Super Admin berhasil dibuat!");
      console.log(`   - ID: ${newUser.id}\n`);
    }

    // Tampilkan statistik admin
    const [superAdminCount, adminCount] = await Promise.all([
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    console.log("📊 Statistik Administrator:");
    console.log(`   - SUPER_ADMIN: ${superAdminCount} user`);
    console.log(`   - ADMIN:       ${adminCount} user`);

    console.log("\n🎉 Selesai! Anda bisa login dengan:");
    console.log(`   📧 Email:    ${SUPER_ADMIN_CONFIG.email}`);
    console.log(`   🔑 Password: ${SUPER_ADMIN_CONFIG.password}`);
    console.log(`   🌐 URL:      http://localhost:3000/login\n`);
  } catch (error) {
    console.error("\n❌ Error membuat Super Admin:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
