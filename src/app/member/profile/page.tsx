import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  User, Phone, MapPin, Briefcase,
  GraduationCap, Calendar, BadgeCheck,
  Save, AlertCircle, CheckCircle2,
} from "lucide-react";
import FotoUpload from "@/components/member/FotoUpload";

export const metadata = { title: "Profile Saya" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/anggota/login");
  const userRole = session.user.role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  const userId = session.user.id;
  const params = await searchParams;

  const anggota = await prisma.anggota.findUnique({ where: { userId } });

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) redirect("/anggota/login");
    const userId = session.user.id;
    const anggota = await prisma.anggota.findUnique({ where: { userId } });
    if (!anggota) return;

    const noHp = formData.get("noHp") as string;
    const alamat = formData.get("alamat") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const pendidikan = formData.get("pendidikan") as string;
    const tempatLahir = formData.get("tempatLahir") as string;
    const tanggalLahirRaw = formData.get("tanggalLahir") as string;

    try {
      await prisma.anggota.update({
        where: { userId },
        data: {
          noHp: noHp || undefined,
          alamat: alamat || undefined,
          pekerjaan: pekerjaan || undefined,
          pendidikan: pendidikan || undefined,
          tempatLahir: tempatLahir || undefined,
          tanggalLahir: tanggalLahirRaw ? new Date(tanggalLahirRaw) : undefined,
        },
      });
      revalidatePath("/member/profile");
      revalidatePath("/member/dashboard");
      redirect("/member/profile?success=1");
    } catch {
      redirect("/member/profile?error=1");
    }
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const avatarUrl =
    anggota?.foto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(anggota?.namaLengkap || session.user.name || "A")}&background=2563eb&color=fff&size=200`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profile Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Perbarui data diri Anda secara mandiri</p>
      </div>

      {params.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Data profil Anda berhasil diperbarui!
        </div>
      )}
      {params.error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Terjadi kesalahan. Silakan coba lagi.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Avatar + Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
            <FotoUpload
              currentFoto={anggota?.foto || null}
              avatarUrl={avatarUrl}
              namaLengkap={anggota?.namaLengkap || session.user.name || ""}
              anggotaId={anggota?.id || ""}
            />
            <h2 className="text-base font-extrabold text-slate-900 mt-4">
              {session.user.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{session.user.email}</p>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                anggota?.status === "AKTIF"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${anggota?.status === "AKTIF" ? "bg-green-500" : "bg-slate-400"}`} />
              {anggota?.status === "AKTIF" ? "Anggota Aktif" : "Non-Aktif"}
            </span>
          </div>

          {/* Read-only info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Keanggotaan</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">NIK</p>
                  <p className="text-sm font-bold text-slate-800">{anggota?.nik || "Belum diisi"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Bergabung</p>
                  <p className="text-sm font-bold text-slate-800">
                    {anggota?.tanggalGabung
                      ? new Date(anggota.tanggalGabung).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "-"}
                  </p>
                </div>
              </div>
              {anggota?.jenisKelamin && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Jenis Kelamin</p>
                    <p className="text-sm font-bold text-slate-800">
                      {anggota.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-50">
              NIK dan tanggal bergabung hanya dapat diubah oleh Admin.
            </p>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2">
          <form action={updateProfile}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 pb-4 border-b border-slate-100">Edit Data Diri</h3>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={anggota?.namaLengkap || session.user.name || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">Nama hanya dapat diubah oleh Admin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="tempatLahir" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Tempat Lahir
                  </label>
                  <input
                    id="tempatLahir" name="tempatLahir" type="text"
                    defaultValue={anggota?.tempatLahir || ""}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tanggalLahir" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Tanggal Lahir
                  </label>
                  <input
                    id="tanggalLahir" name="tanggalLahir" type="date"
                    defaultValue={formatDate(anggota?.tanggalLahir)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="noHp" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  No. WhatsApp / HP
                </label>
                <input
                  id="noHp" name="noHp" type="tel"
                  defaultValue={anggota?.noHp || ""}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pekerjaan" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Pekerjaan
                  </label>
                  <input
                    id="pekerjaan" name="pekerjaan" type="text"
                    defaultValue={anggota?.pekerjaan || ""}
                    placeholder="Contoh: Mahasiswa, Wirausaha"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pendidikan" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Pendidikan Terakhir
                  </label>
                  <select
                    id="pendidikan" name="pendidikan"
                    title="Pilih Pendidikan Terakhir"
                    defaultValue={anggota?.pendidikan || ""}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  >
                    <option value="">-- Pilih Pendidikan --</option>
                    <option value="SD">SD / Sederajat</option>
                    <option value="SMP">SMP / Sederajat</option>
                    <option value="SMA">SMA / SMK / Sederajat</option>
                    <option value="D3">D3 / Diploma</option>
                    <option value="S1">S1 / Sarjana</option>
                    <option value="S2">S2 / Magister</option>
                    <option value="S3">S3 / Doktor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="alamat" className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamat" name="alamat" rows={3}
                  defaultValue={anggota?.alamat || ""}
                  placeholder="Jl. Pisang Batu No. xx, RT/RW ..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
