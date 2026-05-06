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
  const [anggotaCount, kegiatanCount, programCount] = await Promise.all([
    prisma.anggota.count({ where: { status: "AKTIF" } }),
    prisma.kegiatan.count(),
    prisma.program.count(),
  ]);

  const statsData = {
    anggota: anggotaCount,
    kegiatan: kegiatanCount,
    program: programCount,
    tahun: 5, // Hardcoded or calculated later
  };
  return (
    <>
      <HeroSection statsData={statsData} />
      <AboutSection statsData={statsData} />
      <ProgramSection />
      <KegiatanSection />
      <BeritaSection />
      <ArtikelSection />
      <GaleriSection />
      <StatSection statsData={statsData} />
    </>
  );
}
