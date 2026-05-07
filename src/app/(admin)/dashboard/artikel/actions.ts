"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteFileFromStorage } from "@/lib/supabase";

const artikelSchema = z.object({
  judul: z.string().min(5, "Judul artikel minimal 5 karakter"),
  kategori: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  ringkasan: z.string().optional(),
  isi: z.string().min(10, "Isi artikel tidak boleh kosong"),
});

export async function createArtikel(formData: FormData) {
  const parsed = artikelSchema.safeParse({
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
  const thumbnail = formData.get("thumbnail") as string;
  const tagsRaw = formData.get("tags") as string;
  let tags: string[] = [];
  try { tags = tagsRaw ? JSON.parse(tagsRaw) : []; } catch {}

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
        thumbnail: thumbnail || null,
        tags,
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
    // Ambil data artikel untuk hapus thumbnail dari Supabase
    const artikel = await prisma.artikel.findUnique({
      where: { id },
      select: { thumbnail: true },
    });

    // Hapus thumbnail dari Supabase Storage jika ada
    if (artikel?.thumbnail) {
      await deleteFileFromStorage(artikel.thumbnail);
    }

    // Hapus data artikel dari database
    await prisma.artikel.delete({ where: { id } });
    revalidatePath("/dashboard/artikel");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_ARTIKEL_ERROR]", error);
    throw new Error("Gagal menghapus artikel");
  }
}
