import AboutSection from "@/components/public/AboutSection";
import ArtikelSection from "@/components/public/ArtikelSection";
import BeritaSection from "@/components/public/BeritaSection";
import GaleriSection from "@/components/public/GaleriSection";
import HeroSection from "@/components/public/HeroSection";
import KegiatanSection from "@/components/public/KegiatanSection";
import ProgramSection from "@/components/public/ProgramSection";
import StatSection from "@/components/public/StatSection";

import { prisma } from "@/lib/prisma";

// Revalidate every 60 seconds
export const revalidate = 60;

async function getHomePageData() {
  try {
    const [anggotaCount, kegiatanCount, programCount, galeriItems] = await Promise.allSettled([
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

    return {
      anggotaCount: anggotaCount.status === "fulfilled" ? anggotaCount.value : 0,
      kegiatanCount: kegiatanCount.status === "fulfilled" ? kegiatanCount.value : 0,
      programCount: programCount.status === "fulfilled" ? programCount.value : 0,
      galeriItems: galeriItems.status === "fulfilled" ? galeriItems.value : [],
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    // Return fallback values if queries fail
    return {
      anggotaCount: 0,
      kegiatanCount: 0,
      programCount: 0,
      galeriItems: [],
    };
  }
}

export default async function HomePage() {
  const { anggotaCount, kegiatanCount, programCount, galeriItems } = await getHomePageData();

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
