/**
 * Script untuk seed notifikasi contoh
 * Jalankan: npx tsx scripts/seed-notifications.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding notifications...");

  // Get all users with role ANGGOTA
  const anggotaUsers = await prisma.user.findMany({
    where: { role: "ANGGOTA" },
    select: { id: true, name: true },
  });

  if (anggotaUsers.length === 0) {
    console.log("❌ Tidak ada user dengan role ANGGOTA");
    return;
  }

  console.log(`✅ Found ${anggotaUsers.length} anggota users`);

  // Sample notifications
  const notificationTemplates = [
    {
      title: "Kegiatan Baru: Gotong Royong",
      message: "Kegiatan gotong royong akan dilaksanakan pada 15 Mei 2026. Daftar sekarang!",
      type: "kegiatan",
    },
    {
      title: "Laporan Keuangan Bulan April",
      message: "Laporan keuangan bulan April telah tersedia. Lihat transparansi keuangan organisasi.",
      type: "keuangan",
    },
    {
      title: "Voting: Pemilihan Ketua Baru",
      message: "Voting untuk pemilihan ketua periode 2026-2028 telah dibuka. Berikan suara Anda!",
      type: "voting",
    },
    {
      title: "Aspirasi Anda Diproses",
      message: "Aspirasi Anda tentang 'Perbaikan Jalan' sedang diproses oleh pengurus.",
      type: "aspirasi",
    },
    {
      title: "Selamat Datang di Portal Anggota!",
      message: "Terima kasih telah bergabung dengan Karang Taruna Generasi Emas. Lengkapi profil Anda untuk pengalaman yang lebih baik.",
      type: "info",
    },
    {
      title: "Reminder: Iuran Bulan Mei",
      message: "Jangan lupa untuk membayar iuran bulan Mei. Batas pembayaran: 31 Mei 2026.",
      type: "keuangan",
    },
    {
      title: "Kegiatan Selesai: Pelatihan Kewirausahaan",
      message: "Terima kasih telah mengikuti pelatihan kewirausahaan. Sertifikat akan segera dikirim.",
      type: "kegiatan",
    },
  ];

  let totalCreated = 0;

  // Create notifications for each user
  for (const user of anggotaUsers) {
    // Create 3-5 random notifications per user
    const numNotifications = Math.floor(Math.random() * 3) + 3;
    const selectedTemplates = notificationTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, numNotifications);

    for (const template of selectedTemplates) {
      await prisma.notification.create({
        data: {
          ...template,
          userId: user.id,
          isRead: Math.random() > 0.5, // 50% chance already read
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        },
      });
      totalCreated++;
    }

    console.log(`✅ Created notifications for ${user.name}`);
  }

  console.log(`\n🎉 Successfully created ${totalCreated} notifications!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding notifications:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
