"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromStorage } from "@/lib/supabase";
import { auditCreate, auditDelete, auditUpdate } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  createBeritaSchema, 
  updateBeritaSchema, 
  validateFormData 
} from "@/lib/validations";

export async function createBerita(formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, createBeritaSchema);

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
    const berita = await prisma.berita.create({
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
      "berita",
      berita.id,
      data.judul,
      session?.user?.id,
      session?.user?.name || undefined,
      `Created berita: ${data.judul} (${data.status})`
    );
  } catch (error) {
    console.error("[CREATE_BERITA_ERROR]", error);
    throw new Error("Gagal menyimpan data berita");
  }

  revalidatePath("/dashboard/berita");
  redirect("/dashboard/berita");
}

export async function deleteBerita(id: string) {
  const session = await auth();
  
  try {
    // Ambil data berita untuk hapus thumbnail dari Supabase
    const berita = await prisma.berita.findUnique({
      where: { id },
      select: { thumbnail: true, judul: true },
    });

    if (!berita) {
      throw new Error("Berita tidak ditemukan");
    }

    // Hapus thumbnail dari Supabase Storage jika ada
    if (berita.thumbnail) {
      await deleteFileFromStorage(berita.thumbnail);
    }

    // Hapus data berita dari database
    await prisma.berita.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "berita",
      id,
      berita.judul,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted berita: ${berita.judul}`
    );

    revalidatePath("/dashboard/berita");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_BERITA_ERROR]", error);
    throw new Error("Gagal menghapus berita");
  }
}

export async function updateBerita(id: string, formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, updateBeritaSchema);

  try {
    await prisma.berita.update({
      where: { id },
      data: { 
        judul: data.judul, 
        kategori: data.kategori || null, 
        status: data.status, 
        ringkasan: data.ringkasan || null, 
        isi: data.isi 
      },
    });

    // Audit log
    await auditUpdate(
      "berita",
      id,
      data.judul,
      session?.user?.id,
      session?.user?.name || undefined,
      `Updated berita: ${data.judul} (${data.status})`
    );
  } catch (error) {
    console.error("[UPDATE_BERITA_ERROR]", error);
    throw new Error("Gagal mengupdate berita");
  }
  
  revalidatePath("/dashboard/berita");
  redirect("/dashboard/berita");
}
