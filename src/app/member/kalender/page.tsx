import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import KalenderKegiatan from "@/components/member/KalenderKegiatan";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Kalender Kegiatan | Portal Anggota",
};

export default async function KalenderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  // Fetch all kegiatan
  const kegiatan = await prisma.kegiatan.findMany({
    where: {
      status: {
        in: ["UPCOMING", "ONGOING"],
      },
    },
    orderBy: { tanggalMulai: "asc" },
    include: {
      peserta: {
        where: {
          anggota: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  // Transform to calendar events
  const events = kegiatan.map((k) => ({
    id: k.id,
    title: k.nama,
    start: k.tanggalMulai,
    end: k.tanggalSelesai || k.tanggalMulai,
    location: k.lokasi,
    description: k.deskripsi,
    status: k.status,
    isRegistered: k.peserta.length > 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Kalender Kegiatan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lihat jadwal kegiatan dan daftar langsung dari kalender
        </p>
      </div>

      {/* Calendar Component */}
      <KalenderKegiatan events={events} />
    </div>
  );
}
