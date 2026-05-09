/**
 * Seed Script: Generate Certificates
 * 
 * This script generates certificates for completed activities (hadir = true)
 * Run: npx tsx scripts/seed-certificates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 Starting certificate generation...\n");

  // Get all anggota kegiatan where hadir = true and no certificate yet
  const completedActivities = await prisma.anggotaKegiatan.findMany({
    where: {
      hadir: true,
      sertifikat: null,
    },
    include: {
      anggota: true,
      kegiatan: true,
    },
  });

  console.log(`Found ${completedActivities.length} completed activities without certificates\n`);

  let generated = 0;

  for (const activity of completedActivities) {
    try {
      // Generate certificate number
      const year = new Date().getFullYear();
      const count = await prisma.sertifikat.count();
      const nomorSertifikat = `CERT-${year}-${String(count + 1).padStart(5, "0")}`;

      // Generate QR Code URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        nomorSertifikat
      )}`;

      // Create certificate
      await prisma.sertifikat.create({
        data: {
          anggotaKegiatanId: activity.id,
          nomorSertifikat,
          namaAnggota: activity.anggota.namaLengkap,
          namaKegiatan: activity.kegiatan.nama,
          tanggalKegiatan: activity.kegiatan.tanggalMulai,
          qrCode: qrCodeUrl,
        },
      });

      generated++;
      console.log(`✅ Generated: ${nomorSertifikat} - ${activity.anggota.namaLengkap} - ${activity.kegiatan.nama}`);
    } catch (error) {
      console.error(`❌ Failed to generate certificate for ${activity.anggota.namaLengkap}:`, error);
    }
  }

  console.log(`\n✨ Certificate generation complete!`);
  console.log(`📊 Total generated: ${generated} certificates`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
