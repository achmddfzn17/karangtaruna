"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createKegiatan(formData: FormData) {
  const nama = formData.get("nama") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const jenis = formData.get("jenis") as "SOSIAL" | "PENDIDIKAN" | "EKONOMI" | "OLAHRAGA" | "SENI_BUDAYA" | "LAINNYA";
  const tanggalMulai = formData.get("tanggalMulai") as string;
  const tanggalSelesai = formData.get("tanggalSelesai") as string;
  const lokasi = formData.get("lokasi") as string;
  const anggaran = formData.get("anggaran") as string;
  const status = formData.get("status") as "UPCOMING" | "ONGOING" | "SELESAI" | "DIBATALKAN";

  if (!nama || !jenis || !tanggalMulai) {
    throw new Error("Data wajib tidak lengkap");
  }

  try {
    await prisma.kegiatan.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        jenis,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        lokasi: lokasi || null,
        anggaran: anggaran ? parseFloat(anggaran) : null,
        status,
      },
    });
  } catch (error: any) {
    throw new Error("Gagal menyimpan data kegiatan");
  }

  revalidatePath("/dashboard/kegiatan");
  redirect("/dashboard/kegiatan");
}

export async function deleteKegiatan(id: string) {
  try {
    await prisma.kegiatan.delete({ where: { id } });
    revalidatePath("/dashboard/kegiatan");
  } catch (error) {
    throw new Error("Gagal menghapus kegiatan");
  }
}
