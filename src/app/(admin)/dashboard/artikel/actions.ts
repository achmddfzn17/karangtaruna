"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromStorage } from "@/lib/supabase";
import { auditCreate, auditDelete } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-helpers";
import { 
  createArtikelSchema, 
  validateFormData 
} from "@/lib/validations";

export async function createArtikel(formData: FormData) {
  // ✅ Auth check
  const session = await requireAdmin();
  
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
      session.user.id,
      session.user.name || undefined,
      `Created artikel: ${data.judul} (${data.status})`
    );
  } catch (error) {
    console.error("[CREATE_ARTIKEL_ERROR]", error);
    throw new Error("Gagal menyimpan data artikel");
  }

  revalidatePath("/dashboard/artikel");
  revalidatePath("/artikel");
  redirect("/dashboard/artikel");
}

export async function deleteArtikel(id: string) {
  // ✅ Auth check
  const session = await requireAdmin();
  
  // ✅ Validate ID
  if (!id || typeof id !== "string") {
    throw new Error("ID artikel tidak valid");
  }
  
  try {
    // Ambil data artikel untuk hapus thumbnail dari Supabase
    const artikel = await prisma.artikel.findUnique({
      where: { id },
      select: { thumbnail: true, judul: true },
    });

    if (!artikel) {
      throw new Error("Artikel tidak ditemukan");
    }

    // ✅ Hapus thumbnail dari Supabase Storage (dengan error handling)
    if (artikel.thumbnail) {
      try {
        await deleteFileFromStorage(artikel.thumbnail);
      } catch (storageError) {
        console.error("[STORAGE_DELETE_ERROR]", storageError);
        // Continue dengan DB deletion meskipun storage gagal
      }
    }

    // Hapus data artikel dari database
    await prisma.artikel.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "artikel",
      id,
      artikel.judul,
      session.user.id,
      session.user.name || undefined,
      `Deleted artikel: ${artikel.judul}`
    );

    revalidatePath("/dashboard/artikel");
    revalidatePath("/artikel");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_ARTIKEL_ERROR]", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Gagal menghapus artikel");
  }
}
