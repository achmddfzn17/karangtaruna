"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAnggota(formData: FormData) {
  const namaLengkap = formData.get("namaLengkap") as string;
  const nik = formData.get("nik") as string;
  const tempatLahir = formData.get("tempatLahir") as string;
  const tanggalLahir = formData.get("tanggalLahir") as string;
  const jenisKelamin = formData.get("jenisKelamin") as "LAKI_LAKI" | "PEREMPUAN";
  const alamat = formData.get("alamat") as string;
  const noHp = formData.get("noHp") as string;
  const email = formData.get("email") as string;
  const pekerjaan = formData.get("pekerjaan") as string;
  const status = formData.get("status") as "AKTIF" | "NON_AKTIF" | "ALUMNI";

  if (!namaLengkap || !nik || !jenisKelamin) {
    throw new Error("Data tidak lengkap");
  }

  try {
    await prisma.anggota.create({
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
        status,
      },
    });
  } catch (error: any) {
    // Handle unique constraint or other DB errors here
    if (error.code === 'P2002') {
       throw new Error("NIK sudah terdaftar!");
    }
    throw new Error("Gagal menyimpan data anggota");
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}
