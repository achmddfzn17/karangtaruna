import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, UserPlus, Trash2, Users, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ExportAbsensiButton from "@/components/admin/ExportAbsensiButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id }, select: { nama: true } });
  return { title: `Peserta — ${kegiatan?.nama ?? "Kegiatan"}` };
}

export default async function PesertaKegiatanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      peserta: {
        include: { anggota: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!kegiatan) notFound();

  // Anggota yang belum terdaftar sebagai peserta
  const pesertaIds = kegiatan.peserta.map((p) => p.anggotaId);
  const anggotaAvailable = await prisma.anggota.findMany({
    where: {
      status: "AKTIF",
      id: { notIn: pesertaIds },
    },
    orderBy: { namaLengkap: "asc" },
  });

  // Server Action: Tambah peserta
  async function tambahPeserta(formData: FormData) {
    "use server";
    const anggotaId = formData.get("anggotaId") as string;
    if (!anggotaId) return;

    try {
      await prisma.anggotaKegiatan.create({
        data: { anggotaId, kegiatanId: id },
      });
      revalidatePath(`/dashboard/kegiatan/peserta/${id}`);
    } catch {
      throw new Error("Gagal menambahkan peserta");
    }
  }

  // Server Action: Hapus peserta
  async function hapusPeserta(formData: FormData) {
    "use server";
    const pesertaId = formData.get("pesertaId") as string;
    if (!pesertaId) return;

    try {
      await prisma.anggotaKegiatan.delete({ where: { id: pesertaId } });
      revalidatePath(`/dashboard/kegiatan/peserta/${id}`);
    } catch {
      throw new Error("Gagal menghapus peserta");
    }
  }

  // Server Action: Toggle kehadiran
  async function toggleHadir(formData: FormData) {
    "use server";
    const pesertaId = formData.get("pesertaId") as string;
    const currentHadir = formData.get("hadir") === "true";
    if (!pesertaId) return;

    try {
      await prisma.anggotaKegiatan.update({
        where: { id: pesertaId },
        data: { hadir: !currentHadir },
      });
      revalidatePath(`/dashboard/kegiatan/peserta/${id}`);
    } catch {
      throw new Error("Gagal mengupdate kehadiran");
    }
  }

  const totalHadir = kegiatan.peserta.filter((p) => p.hadir).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/kegiatan"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Peserta</h1>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{kegiatan.nama}</p>
        </div>
        <ExportAbsensiButton
          namaKegiatan={kegiatan.nama}
          tanggal={formatDate(kegiatan.tanggalMulai)}
          peserta={kegiatan.peserta as any}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold mb-1">Total Peserta</p>
          <p className="text-2xl font-extrabold text-slate-900">{kegiatan.peserta.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-xs text-green-600 font-semibold mb-1">Hadir</p>
          <p className="text-2xl font-extrabold text-green-600">{totalHadir}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
          <p className="text-xs text-slate-500 font-semibold mb-1">Belum Hadir</p>
          <p className="text-2xl font-extrabold text-slate-600">{kegiatan.peserta.length - totalHadir}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Peserta */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              Tambah Peserta
            </h2>

            {anggotaAvailable.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Semua anggota aktif sudah terdaftar.
              </p>
            ) : (
              <form action={tambahPeserta} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="anggotaId" className="text-[12px] font-bold text-slate-600">
                    Pilih Anggota
                  </label>
                  <select
                    id="anggotaId"
                    name="anggotaId"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {anggotaAvailable.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambahkan
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Daftar Peserta */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Daftar Peserta ({kegiatan.peserta.length})
              </h2>
            </div>

            {kegiatan.peserta.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Belum ada peserta terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {kegiatan.peserta.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {p.anggota.namaLengkap.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.anggota.namaLengkap}</p>
                        <p className="text-[11px] text-slate-400">
                          Didaftarkan {formatDate(p.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle Kehadiran */}
                      <form action={toggleHadir}>
                        <input type="hidden" name="pesertaId" value={p.id} />
                        <input type="hidden" name="hadir" value={String(p.hadir)} />
                        <button
                          type="submit"
                          title={p.hadir ? "Tandai Tidak Hadir" : "Tandai Hadir"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                            p.hadir
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {p.hadir ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Hadir</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Belum</>
                          )}
                        </button>
                      </form>
                      {/* Hapus Peserta */}
                      <form action={hapusPeserta}>
                        <input type="hidden" name="pesertaId" value={p.id} />
                        <button
                          type="submit"
                          title="Hapus dari daftar peserta"
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
