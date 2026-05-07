"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { deleteFileFromStorage } from "@/lib/supabase";

export async function updateAnggota(id: string, formData: FormData) {
  const namaLengkap = formData.get("namaLengkap") as string;
  const nik = formData.get("nik") as string;
  const tempatLahir = formData.get("tempatLahir") as string;
  const tanggalLahir = formData.get("tanggalLahir") as string;
  const jenisKelamin = formData.get("jenisKelamin") as "LAKI_LAKI" | "PEREMPUAN";
  const alamat = formData.get("alamat") as string;
  const noHp = formData.get("noHp") as string;
  const email = formData.get("email") as string;
  const pekerjaan = formData.get("pekerjaan") as string;
  const pendidikan = formData.get("pendidikan") as string;
  const status = formData.get("status") as "AKTIF" | "NON_AKTIF" | "ALUMNI";
  const foto = formData.get("foto") as string;

  if (!namaLengkap || !nik || !jenisKelamin) {
    throw new Error("Data tidak lengkap");
  }

  // Ambil userId dulu sebelum update
  const existing = await prisma.anggota.findUnique({
    where: { id },
    select: { userId: true },
  });

  try {
    await prisma.anggota.update({
      where: { id },
      data: {
        namaLengkap,
        nik,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        jenisKelamin,
        alamat: alamat || null,
        noHp: noHp || null,
        email: email || null,
        pekerjaan: pekerjaan || null,
        pendidikan: pendidikan || null,
        foto: foto || null,
        status,
      },
    });

    // Sync nama ke User terkait jika ada
    if (existing?.userId) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { name: namaLengkap },
      }).catch(() => {});
    }
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("NIK sudah terdaftar oleh anggota lain");
    }
    throw new Error("Gagal mengupdate data anggota");
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function deleteAnggota(id: string) {
  // Cari data anggota sebelum hapus untuk ambil foto dan userId
  const anggota = await prisma.anggota.findUnique({
    where: { id },
    select: { userId: true, foto: true },
  });

  try {
    // Hapus foto dari Supabase Storage jika ada
    if (anggota?.foto) {
      await deleteFileFromStorage(anggota.foto);
    }

    // Hapus data anggota dari database
    await prisma.anggota.delete({ where: { id } });

    // Hapus User terkait jika ada
    if (anggota?.userId) {
      await prisma.user
        .delete({ where: { id: anggota.userId } })
        .catch(() => {});
    }
  } catch (error) {
    console.error("[DELETE_ANGGOTA_ERROR]", error);
    throw new Error("Gagal menghapus data anggota");
  }

  revalidatePath("/dashboard/anggota");
}

/**
 * Buat akun login untuk anggota yang belum punya akun
 */
export async function buatAkunAnggota(anggotaId: string, formData: FormData) {
  const loginEmail = formData.get("loginEmail") as string;
  const loginPassword = formData.get("loginPassword") as string;

  if (!loginEmail) throw new Error("Email login wajib diisi");
  if (!loginPassword || loginPassword.length < 8)
    throw new Error("Password minimal 8 karakter");

  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: { namaLengkap: true, userId: true },
  });
  if (!anggota) throw new Error("Anggota tidak ditemukan");
  if (anggota.userId) throw new Error("Anggota sudah memiliki akun login");

  const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
  if (existingUser) throw new Error("Email sudah digunakan akun lain");

  const hashedPassword = await bcrypt.hash(loginPassword, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: anggota.namaLengkap,
        email: loginEmail,
        password: hashedPassword,
        role: "ANGGOTA",
      },
    });
    await tx.anggota.update({
      where: { id: anggotaId },
      data: { userId: user.id },
    });
  });

  revalidatePath("/dashboard/anggota");
  redirect(`/dashboard/anggota/akun/${anggotaId}`);
}

/**
 * Reset password akun anggota
 */
export async function resetPasswordAnggota(userId: string, formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  if (!newPassword || newPassword.length < 8)
    throw new Error("Password minimal 8 karakter");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePath("/dashboard/anggota");
}
