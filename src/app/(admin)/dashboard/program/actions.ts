"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteProgram(id: string) {
  try {
    await prisma.program.delete({ where: { id } });
    revalidatePath("/dashboard/program");
  } catch (error) {
    throw new Error("Gagal menghapus program");
  }
}
