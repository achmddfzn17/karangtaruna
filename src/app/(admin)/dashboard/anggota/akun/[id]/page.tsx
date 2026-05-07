import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, KeyRound, ShieldCheck, Eye } from "lucide-react";
import BuatAkunForm from "./BuatAkunForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anggota = await prisma.anggota.findUnique({ where: { id }, select: { namaLengkap: true } });
  return { title: `Akun — ${anggota?.namaLengkap ?? "Anggota"}` };
}

export default async function AkunAnggotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const anggota = await prisma.anggota.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, createdAt: true } } },
  });

  if (!anggota) notFound();

  const sudahPunyaAkun = !!anggota.userId;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/anggota"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Akun Login</h1>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{anggota.namaLengkap}</p>
        </div>
      </div>

      {/* Info anggota */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
          {anggota.namaLengkap.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-900">{anggota.namaLengkap}</p>
          <p className="text-sm text-slate-500">NIK: {anggota.nik}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
            sudahPunyaAkun ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}>
            {sudahPunyaAkun ? "✓ Punya Akun" : "Belum Ada Akun"}
          </span>
        </div>
      </div>

      {sudahPunyaAkun ? (
        /* ── Sudah punya akun — tampilkan info + reset password ── */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Akun Aktif</p>
                <p className="text-xs text-slate-500">Anggota dapat login ke portal member</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Email Login</span>
                <span className="font-bold text-slate-800">{anggota.user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Dibuat</span>
                <span className="font-bold text-slate-800">
                  {anggota.user?.createdAt
                    ? new Date(anggota.user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-500 font-medium">URL Login</span>
                <Link
                  href="/anggota/login"
                  target="_blank"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  /anggota/login <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Reset Password */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Reset Password</p>
                <p className="text-xs text-slate-500">Ganti password akun anggota ini</p>
              </div>
            </div>
            <BuatAkunForm
              anggotaId={id}
              userId={anggota.userId!}
              mode="reset"
            />
          </div>
        </div>
      ) : (
        /* ── Belum punya akun — form buat akun ── */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Buat Akun Login</p>
              <p className="text-xs text-slate-500">Anggota akan bisa login ke portal member</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-5">
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">Akun ini digunakan untuk login di <strong>/anggota/login</strong></span>
          </div>

          <BuatAkunForm
            anggotaId={id}
            userId={null}
            mode="create"
            defaultEmail={anggota.email ?? ""}
          />
        </div>
      )}
    </div>
  );
}
