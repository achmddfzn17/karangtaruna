"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const beritaSchema = z.object({
  judul: z.string().min(5, "Judul berita minimal 5 karakter"),
  kategori: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  ringkasan: z.string().optional(),
  isi: z.string().min(10, "Isi berita tidak boleh kosong"),
});

export async function createBerita(formData: FormData) {
  const parsed = beritaSchema.safeParse({
    judul: formData.get("judul"),
    kategori: formData.get("kategori"),
    status: formData.get("status"),
    ringkasan: formData.get("ringkasan"),
    isi: formData.get("isi"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { judul, kategori, status, ringkasan, isi } = parsed.data;

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
  const parsed = beritaSchema.safeParse({
    judul: formData.get("judul"),
    kategori: formData.get("kategori"),
    status: formData.get("status"),
    ringkasan: formData.get("ringkasan"),
    isi: formData.get("isi"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { judul, kategori, status, ringkasan, isi } = parsed.data;

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
