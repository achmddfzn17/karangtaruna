"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBerita(formData: FormData) {
  const judul = formData.get("judul") as string;
  const kategori = formData.get("kategori") as string;
  const status = formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const ringkasan = formData.get("ringkasan") as string;
  const isi = formData.get("isi") as string;

  if (!judul || !isi) {
    throw new Error("Judul dan isi berita wajib diisi");
  }

  // Buat slug sederhana dari judul
  const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Date.now();

  try {
    await prisma.berita.create({
      data: {
        judul,
        slug,
        kategori: kategori || null,
        status,
        ringkasan: ringkasan || null,
        isi,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
  } catch (error: any) {
    throw new Error("Gagal menyimpan data berita");
  }

  revalidatePath("/dashboard/berita");
  redirect("/dashboard/berita");
}

export async function deleteBerita(id: string) {
  try {
    await prisma.berita.delete({ where: { id } });
    revalidatePath("/dashboard/berita");
  } catch (error) {
    throw new Error("Gagal menghapus berita");
  }
}

export async function updateBerita(id: string, formData: FormData) {
  const judul = formData.get("judul") as string;
  const kategori = formData.get("kategori") as string;
  const status = formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const ringkasan = formData.get("ringkasan") as string;
  const isi = formData.get("isi") as string;

  if (!judul || !isi) throw new Error("Judul dan isi berita wajib diisi");

  try {
    await prisma.berita.update({
      where: { id },
      data: { judul, kategori: kategori || null, status, ringkasan: ringkasan || null, isi },
    });
  } catch (error) {
    throw new Error("Gagal mengupdate berita");
  }
  revalidatePath("/dashboard/berita");
  redirect("/dashboard/berita");
}
