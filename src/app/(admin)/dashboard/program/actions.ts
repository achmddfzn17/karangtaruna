"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFileFromStorage } from "@/lib/supabase";

export async function deleteProgram(id: string) {
  try {
    // Ambil data program untuk hapus thumbnail dari Supabase
    const program = await prisma.program.findUnique({
      where: { id },
      select: { thumbnail: true },
    });

    // Hapus thumbnail dari Supabase Storage jika ada
    if (program?.thumbnail) {
      await deleteFileFromStorage(program.thumbnail);
    }

    // Hapus data program dari database
    await prisma.program.delete({ where: { id } });
    revalidatePath("/dashboard/program");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_PROGRAM_ERROR]", error);
    throw new Error("Gagal menghapus program");
  }
}

import { z } from "zod";
import { redirect } from "next/navigation";

const programSchema = z.object({
  nama: z.string().min(3, "Nama program minimal 3 karakter"),
  deskripsi: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z.preprocess((val) => val === "true", z.boolean()),
  urutan: z.preprocess((val) => Number(val), z.number().min(0)),
});

export async function createProgram(formData: FormData) {
  const parsed = programSchema.safeParse({
    nama: formData.get("nama"),
    deskripsi: formData.get("deskripsi"),
    icon: formData.get("icon"),
    thumbnail: formData.get("thumbnail"),
    status: formData.get("status") || "true",
    urutan: formData.get("urutan") || "0",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { nama, deskripsi, icon, thumbnail, status, urutan } = parsed.data;

  try {
    await prisma.program.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        icon: icon || null,
        thumbnail: thumbnail || null,
        status,
        urutan,
      },
    });
  } catch (error: any) {
    throw new Error("Gagal menyimpan data program");
  }

  revalidatePath("/dashboard/program");
  redirect("/dashboard/program");
}
