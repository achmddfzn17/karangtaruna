"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const kegiatanSchema = z.object({
  nama: z.string().min(5, "Nama kegiatan minimal 5 karakter"),
  deskripsi: z.string().optional(),
  jenis: z.enum(["SOSIAL", "PENDIDIKAN", "EKONOMI", "OLAHRAGA", "SENI_BUDAYA", "LAINNYA"]),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().optional(),
  lokasi: z.string().optional(),
  anggaran: z.string().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "SELESAI", "DIBATALKAN"]),
});

export async function createKegiatan(formData: FormData) {
  const parsed = kegiatanSchema.safeParse({
    nama: formData.get("nama"),
    deskripsi: formData.get("deskripsi"),
    jenis: formData.get("jenis"),
    tanggalMulai: formData.get("tanggalMulai"),
    tanggalSelesai: formData.get("tanggalSelesai"),
    lokasi: formData.get("lokasi"),
    anggaran: formData.get("anggaran"),
    status: formData.get("status") || "UPCOMING",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { nama, deskripsi, jenis, tanggalMulai, tanggalSelesai, lokasi, anggaran, status } = parsed.data;

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
