import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AttendanceToggle } from "@/components/admin/AttendanceToggle";

export const metadata = {
  title: "Absensi Kegiatan",
};

export default async function AbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ kegiatanId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const kegiatanId = params.kegiatanId;

  // Fetch kegiatan yang sedang berlangsung atau akan datang
  const kegiatan = await prisma.kegiatan.findMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
    },
    select: {
      id: true,
      nama: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      status: true,
      jenis: true,
    },
    orderBy: { tanggalMulai: "asc" },
  });

  let selectedKegiatan = null;
  let peserta: any[] = [];

  if (kegiatanId) {
    selectedKegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: {
        peserta: {
          include: {
            anggota: { select: { namaLengkap: true, foto: true } },
            sertifikat: true,
          },
          orderBy: { anggota: { namaLengkap: "asc" } },
        },
      },
    });

    if (selectedKegiatan) {
      peserta = selectedKegiatan.peserta;
    }
  }

  const hadirCount = peserta.filter((p) => p.hadir).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Absensi Kegiatan</h1>
        <p className="text-slate-600 mt-1">Kelola kehadiran anggota dalam kegiatan</p>
      </div>

      {/* Kegiatan Select */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <label className="block text-sm font-semibold mb-3">Pilih Kegiatan</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {kegiatan.map((k) => (
            <Link
              key={k.id}
              href={`/dashboard/absensi?kegiatanId=${k.id}`}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                kegiatanId === k.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold text-sm">{k.nama}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                <Calendar className="w-3 h-3" />
                {formatDate(k.tanggalMulai)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    k.status === "ONGOING"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {k.status === "ONGOING" ? "Sedang Berlangsung" : "Akan Datang"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Attendance List */}
      {selectedKegiatan ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-900">{selectedKegiatan.nama}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-blue-700 font-semibold">Total Peserta</p>
                <p className="text-2xl font-bold text-blue-900">{peserta.length}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 font-semibold">Hadir</p>
                <p className="text-2xl font-bold text-green-600">{hadirCount}</p>
              </div>
              <div>
                <p className="text-xs text-red-700 font-semibold">Tidak Hadir</p>
                <p className="text-2xl font-bold text-red-600">{peserta.length - hadirCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-700 font-semibold">Persentase</p>
                <p className="text-2xl font-bold">
                  {peserta.length > 0 ? ((hadirCount / peserta.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {peserta.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium">Tidak ada peserta terdaftar</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Nama Anggota</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Status Kehadiran</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Sertifikat</th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {peserta.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {p.anggota.foto ? (
                            <div className="relative w-8 h-8 shrink-0">
                              <Image
                                src={p.anggota.foto}
                                alt={p.anggota.namaLengkap}
                                fill
                                className="rounded-full object-cover"
                                sizes="32px"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {p.anggota.namaLengkap.charAt(0)}
                            </div>
                          )}
                          {p.anggota.namaLengkap}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            p.hadir
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.hadir ? "Hadir" : "Tidak Hadir"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.sertifikat ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                            {p.sertifikat.nomorSertifikat}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <AttendanceToggle
                          anggotaKegiatanId={p.id}
                          kegiatanId={selectedKegiatan.id}
                          currentStatus={p.hadir}
                          namaAnggota={p.anggota.namaLengkap}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm font-medium">Pilih kegiatan untuk mulai mencatat absensi</p>
        </div>
      )}
    </div>
  );
}
