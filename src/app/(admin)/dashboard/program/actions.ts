"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromStorage } from "@/lib/supabase";
import { auditDelete, auditCreate } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  createProgramSchema, 
  validateFormData 
} from "@/lib/validations";

export async function deleteProgram(id: string) {
  const session = await auth();
  
  try {
    // Ambil data program untuk hapus thumbnail dari Supabase
    const program = await prisma.program.findUnique({
      where: { id },
      select: { thumbnail: true, nama: true },
    });

    if (!program) {
      throw new Error("Program tidak ditemukan");
    }

    // Hapus thumbnail dari Supabase Storage jika ada
    if (program.thumbnail) {
      await deleteFileFromStorage(program.thumbnail);
    }

    // Hapus data program dari database
    await prisma.program.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "program",
      id,
      program.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted program: ${program.nama}`
    );

    revalidatePath("/dashboard/program");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_PROGRAM_ERROR]", error);
    throw new Error("Gagal menghapus program");
  }
}

export async function createProgram(formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  // Manual parsing for boolean and number types
  const rawData = {
    nama: formData.get("nama") as string,
    deskripsi: formData.get("deskripsi") as string,
    icon: formData.get("icon") as string,
    thumbnail: formData.get("thumbnail") as string,
    status: formData.get("status") === "true",
    urutan: Number(formData.get("urutan") || "0"),
  };
  
  const validation = createProgramSchema.safeParse(rawData);
  
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }
  
  const data = validation.data;

  try {
    const program = await prisma.program.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
        icon: data.icon || null,
        thumbnail: data.thumbnail || null,
        status: data.status,
        urutan: data.urutan,
      },
    });

    // Audit log
    await auditCreate(
      "program",
      program.id,
      data.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Created program: ${data.nama}`
    );
  } catch (error) {
    console.error("[CREATE_PROGRAM_ERROR]", error);
    throw new Error("Gagal menyimpan data program");
  }

  revalidatePath("/dashboard/program");
  redirect("/dashboard/program");
}
