"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createArtikel(formData: FormData) {
  const judul = formData.get("judul") as string;
  const kategori = formData.get("kategori") as string;
  const status = formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const ringkasan = formData.get("ringkasan") as string;
  const isi = formData.get("isi") as string;

  if (!judul || !isi) {
    throw new Error("Judul dan isi artikel wajib diisi");
  }

  const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Date.now();

  try {
    await prisma.artikel.create({
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
    throw new Error("Gagal menyimpan data artikel");
  }

  revalidatePath("/dashboard/artikel");
  redirect("/dashboard/artikel");
}

export async function deleteArtikel(id: string) {
  try {
    await prisma.artikel.delete({ where: { id } });
    revalidatePath("/dashboard/artikel");
  } catch (error) {
    throw new Error("Gagal menghapus artikel");
  }
}
