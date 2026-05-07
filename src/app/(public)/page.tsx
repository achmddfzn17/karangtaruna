import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import ProgramSection from "@/components/public/ProgramSection";
import KegiatanSection from "@/components/public/KegiatanSection";
import BeritaSection from "@/components/public/BeritaSection";
import ArtikelSection from "@/components/public/ArtikelSection";
import GaleriSection from "@/components/public/GaleriSection";
import StatSection from "@/components/public/StatSection";

import { prisma } from "@/lib/prisma";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const [anggotaCount, kegiatanCount, programCount, galeriItems] = await Promise.all([
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    prisma.kegiatan.count(),
    prisma.program.count(),
    prisma.galeriItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        judul: true,
        url: true,
        type: true,
        deskripsi: true,
        kegiatan: { select: { nama: true } },
      },
    }),
  ]);

  const statsData = {
    anggota: anggotaCount,
    kegiatan: kegiatanCount,
    program: programCount,
    tahun: 5,
  };

  return (
    <>
      <HeroSection statsData={statsData} />
      <AboutSection statsData={statsData} />
      <ProgramSection />
      <KegiatanSection />
      <BeritaSection />
      <ArtikelSection />
      <GaleriSection items={galeriItems} />
      <StatSection statsData={statsData} />
    </>
  );
}
