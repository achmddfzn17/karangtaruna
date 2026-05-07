"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

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
  const foto = formData.get("foto") as string;

  // Akun login (opsional)
  const buatAkun = formData.get("buatAkun") === "true";
  const loginEmail = formData.get("loginEmail") as string;
  const loginPassword = formData.get("loginPassword") as string;

  if (!namaLengkap || !nik || !jenisKelamin) {
    throw new Error("Data tidak lengkap");
  }

  // Validasi akun jika dipilih
  if (buatAkun) {
    if (!loginEmail) throw new Error("Email login wajib diisi");
    if (!loginPassword || loginPassword.length < 8)
      throw new Error("Password minimal 8 karakter");

    const existing = await prisma.user.findUnique({ where: { email: loginEmail } });
    if (existing) throw new Error("Email login sudah digunakan akun lain");
  }

  try {
    if (buatAkun) {
      // Buat User + Anggota sekaligus dalam satu transaksi
      const hashedPassword = await bcrypt.hash(loginPassword, 12);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: namaLengkap,
            email: loginEmail,
            password: hashedPassword,
            role: "ANGGOTA",
          },
        });

        await tx.anggota.create({
          data: {
            userId: user.id,
            namaLengkap,
            nik,
            tempatLahir: tempatLahir || null,
            tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
            jenisKelamin,
            alamat: alamat || null,
            noHp: noHp || null,
            email: email || loginEmail,
            pekerjaan: pekerjaan || null,
            foto: foto || null,
            status,
          },
        });
      });
    } else {
      // Buat Anggota tanpa akun
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
          foto: foto || null,
          status,
        },
      });
    }
  } catch (error: any) {
    if (error.code === "P2002") throw new Error("NIK sudah terdaftar!");
    throw error;
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}
