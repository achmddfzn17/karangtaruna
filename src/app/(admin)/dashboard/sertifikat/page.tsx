import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { File, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SertifikatListItem } from "@/components/admin/SertifikatListItem";

export const metadata = {
  title: "Manajemen Sertifikat",
};

export default async function SertifikatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const page = parseInt(params.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { namaAnggota: { contains: search, mode: "insensitive" as const } },
          { namaKegiatan: { contains: search, mode: "insensitive" as const } },
          { nomorSertifikat: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [sertifikat, total] = await Promise.all([
    prisma.sertifikat.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sertifikat.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Sertifikat</h1>
        <p className="text-slate-600 mt-1">Total: {total} sertifikat</p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2 bg-white rounded-lg border border-slate-200 p-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          name="q"
          type="text"
          defaultValue={search}
          placeholder="Cari nama anggota, kegiatan, atau nomor sertifikat..."
          className="flex-1 text-sm focus:outline-none"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          Cari
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sertifikat.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium">Tidak ada sertifikat ditemukan</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Nomor Sertifikat</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Nama Anggota</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Kegiatan</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Tanggal Terbit</th>
                  <th className="px-4 py-3 text-left font-semibold text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sertifikat.map((cert) => (
                  <SertifikatListItem key={cert.id} sertifikat={cert} />
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Halaman {page} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/dashboard/sertifikat?q=${search}&page=${page - 1}`}
                      className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                    >
                      Sebelumnya
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/dashboard/sertifikat?q=${search}&page=${page + 1}`}
                      className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                    >
                      Berikutnya
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
