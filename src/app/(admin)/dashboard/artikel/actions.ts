"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromStorage } from "@/lib/supabase";
import { auditCreate, auditDelete } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  createArtikelSchema, 
  validateFormData 
} from "@/lib/validations";

export async function createArtikel(formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, createArtikelSchema);

  const tagsRaw = formData.get("tags") as string;
  let tags: string[] = [];
  try { 
    tags = tagsRaw ? JSON.parse(tagsRaw) : []; 
  } catch (error) {
    console.error("[PARSE_TAGS_ERROR]", error);
  }

  const slug = data.judul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now();

  try {
    const artikel = await prisma.artikel.create({
      data: {
        judul: data.judul,
        slug,
        kategori: data.kategori || null,
        status: data.status,
        ringkasan: data.ringkasan || null,
        isi: data.isi,
        thumbnail: data.thumbnail || null,
        tags,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    // Audit log
    await auditCreate(
      "artikel",
      artikel.id,
      data.judul,
      session?.user?.id,
      session?.user?.name || undefined,
      `Created artikel: ${data.judul} (${data.status})`
    );
  } catch (error) {
    console.error("[CREATE_ARTIKEL_ERROR]", error);
    throw new Error("Gagal menyimpan data artikel");
  }

  revalidatePath("/dashboard/artikel");
  redirect("/dashboard/artikel");
}

export async function deleteArtikel(id: string) {
  const session = await auth();
  
  try {
    // Ambil data artikel untuk hapus thumbnail dari Supabase
    const artikel = await prisma.artikel.findUnique({
      where: { id },
      select: { thumbnail: true, judul: true },
    });

    if (!artikel) {
      throw new Error("Artikel tidak ditemukan");
    }

    // Hapus thumbnail dari Supabase Storage jika ada
    if (artikel.thumbnail) {
      await deleteFileFromStorage(artikel.thumbnail);
    }

    // Hapus data artikel dari database
    await prisma.artikel.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "artikel",
      id,
      artikel.judul,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted artikel: ${artikel.judul}`
    );

    revalidatePath("/dashboard/artikel");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_ARTIKEL_ERROR]", error);
    throw new Error("Gagal menghapus artikel");
  }
}
