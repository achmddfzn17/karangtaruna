import "dotenv/config";
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@karangtaruna.id' },
    update: {},
    create: {
      email: 'admin@karangtaruna.id',
      name: 'Admin Utama',
      password: adminPassword,
      role: 'ADMIN',
      admin: {
        create: {
          nip: '1234567890',
          jabatan: 'Ketua',
        }
      }
    },
  });
  console.log('✅ Admin account created: admin@karangtaruna.id / admin123');

  // 2. Create Anggota
  const anggotaPassword = await bcrypt.hash('anggota123', 10);
  const anggotaUser = await prisma.user.upsert({
    where: { email: 'anggota@karangtaruna.id' },
    update: {},
    create: {
      email: 'anggota@karangtaruna.id',
      name: 'Budi Santoso',
      password: anggotaPassword,
      role: 'ANGGOTA',
      anggota: {
        create: {
          namaLengkap: 'Budi Santoso',
          nik: '3201234567890001',
          jenisKelamin: 'LAKI_LAKI',
          status: 'AKTIF',
          noHp: '081234567890',
        }
      }
    },
  });
  console.log('✅ Anggota account created: anggota@karangtaruna.id / anggota123');

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Note: We don't need to disconnect PrismaPg explicitly because Next.js handles it,
    // but PrismaClient disconnects properly when called.
  });
