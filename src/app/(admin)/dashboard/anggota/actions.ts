"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { deleteFileFromStorage } from "@/lib/supabase";
import { auditUpdate, auditDelete, auditCreate } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  updateAnggotaSchema, 
  buatAkunSchema, 
  resetPasswordSchema,
  validateFormData 
} from "@/lib/validations";

export async function updateAnggota(id: string, formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, updateAnggotaSchema);

  // Ambil userId dulu sebelum update
  const existing = await prisma.anggota.findUnique({
    where: { id },
    select: { userId: true },
  });

  try {
    await prisma.anggota.update({
      where: { id },
      data: {
        namaLengkap: data.namaLengkap,
        nik: data.nik,
        tempatLahir: data.tempatLahir || null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        jenisKelamin: data.jenisKelamin,
        alamat: data.alamat || null,
        noHp: data.noHp || null,
        email: data.email || null,
        pekerjaan: data.pekerjaan || null,
        pendidikan: data.pendidikan || null,
        foto: data.foto || null,
        status: data.status,
      },
    });

    // Sync nama ke User terkait jika ada
    if (existing?.userId) {
      try {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { name: data.namaLengkap },
        });
      } catch (error) {
        console.error("[UPDATE_USER_NAME_ERROR]", error);
        // Don't fail the operation if user update fails
      }
    }

    // Audit log
    await auditUpdate(
      "anggota",
      id,
      data.namaLengkap,
      session?.user?.id,
      session?.user?.name || undefined,
      `Updated anggota: ${data.namaLengkap} (${data.nik})`
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new Error("NIK sudah terdaftar oleh anggota lain");
    }
    console.error("[UPDATE_ANGGOTA_ERROR]", error);
    throw new Error("Gagal mengupdate data anggota");
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function deleteAnggota(id: string) {
  const session = await auth();
  
  // Cari data anggota sebelum hapus untuk ambil foto dan userId
  const anggota = await prisma.anggota.findUnique({
    where: { id },
    select: { userId: true, foto: true, namaLengkap: true, nik: true },
  });

  if (!anggota) {
    throw new Error("Anggota tidak ditemukan");
  }

  try {
    // Hapus foto dari Supabase Storage jika ada
    if (anggota.foto) {
      await deleteFileFromStorage(anggota.foto);
    }

    // Hapus data anggota dari database
    await prisma.anggota.delete({ where: { id } });

    // Hapus User terkait jika ada
    if (anggota.userId) {
      await prisma.user
        .delete({ where: { id: anggota.userId } })
        .catch(() => {});
    }

    // Audit log
    await auditDelete(
      "anggota",
      id,
      anggota.namaLengkap,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted anggota: ${anggota.namaLengkap} (${anggota.nik})`
    );
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
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const { loginEmail, loginPassword } = validateFormData(formData, buatAkunSchema);

  const anggota = await prisma.anggota.findUnique({
    where: { id: anggotaId },
    select: { namaLengkap: true, userId: true },
  });
  
  if (!anggota) throw new Error("Anggota tidak ditemukan");
  if (anggota.userId) throw new Error("Anggota sudah memiliki akun login");

  const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
  if (existingUser) throw new Error("Email sudah digunakan akun lain");

  const hashedPassword = await bcrypt.hash(loginPassword, 12);

  let newUserId: string | undefined;
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: anggota.namaLengkap,
        email: loginEmail,
        password: hashedPassword,
        role: "ANGGOTA",
      },
    });
    newUserId = user.id;
    await tx.anggota.update({
      where: { id: anggotaId },
      data: { userId: user.id },
    });
  });

  // Audit log
  await auditCreate(
    "anggota",
    anggotaId,
    anggota.namaLengkap,
    session?.user?.id,
    session?.user?.name || undefined,
    `Created login account for anggota: ${anggota.namaLengkap} (${loginEmail})`
  );

  revalidatePath("/dashboard/anggota");
  redirect(`/dashboard/anggota/akun/${anggotaId}`);
}

/**
 * Reset password akun anggota
 */
export async function resetPasswordAnggota(userId: string, formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const { newPassword } = validateFormData(formData, resetPasswordSchema);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // ✅ AUDIT LOG for sensitive operation
  await auditUpdate(
    "auth",
    userId,
    "Password Reset",
    session?.user?.id,
    session?.user?.name || undefined,
    `Reset password for user: ${userId}`
  );

  revalidatePath("/dashboard/anggota");
}
