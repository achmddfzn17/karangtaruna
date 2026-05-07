"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Validation Schema
const createPollingSchema = z.object({
  judul: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter")
    .trim(),
  deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").optional(),
  options: z
    .string()
    .min(1, "Pilihan tidak boleh kosong")
    .transform((val) =>
      val
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o !== "")
    )
    .refine((arr) => arr.length >= 2, "Minimal 2 pilihan diperlukan")
    .refine((arr) => arr.length <= 10, "Maksimal 10 pilihan")
    .refine((arr) => new Set(arr).size === arr.length, "Pilihan tidak boleh duplikat"),
  expiresAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : null))
    .refine(
      (date) => !date || date > new Date(),
      "Tanggal kadaluarsa harus di masa depan"
    ),
});

const idSchema = z.string().cuid("ID tidak valid");

export async function createPolling(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const rawData = {
    judul: formData.get("judul"),
    deskripsi: formData.get("deskripsi") || "",
    options: formData.get("options"),
    expiresAt: formData.get("expiresAt") || "",
  };

  const validation = createPollingSchema.safeParse(rawData);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const errorMsg = Object.values(errors).flat()[0] || "Validasi gagal";
    redirect(`/dashboard/voting?error=${encodeURIComponent(errorMsg)}`);
  }

  const { judul, deskripsi, options, expiresAt } = validation.data;

  try {
    await prisma.polling.create({
      data: {
        judul,
        deskripsi: deskripsi || null,
        expiresAt,
        options: { create: options.map((label) => ({ label })) },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userName: session.user.name || session.user.email || "Unknown",
        action: "CREATE",
        module: "voting",
        targetName: judul,
        detail: `Membuat voting dengan ${options.length} pilihan`,
      },
    });

    revalidatePath("/dashboard/voting");
    revalidatePath("/member/voting");
    revalidatePath("/dashboard");
    redirect("/dashboard/voting?success=1");
  } catch (error) {
    console.error("[CREATE_POLLING_ERROR]", error);
    redirect("/dashboard/voting?error=Gagal+membuat+voting");
  }
}

export async function togglePollingStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  const idValidation = idSchema.safeParse(id);
  if (!idValidation.success) {
    redirect("/dashboard/voting?error=ID+tidak+valid");
  }

  try {
    const polling = await prisma.polling.findUnique({
      where: { id },
      select: { judul: true, expiresAt: true },
    });

    if (!polling) {
      redirect("/dashboard/voting?error=Voting+tidak+ditemukan");
    }

    // Cek apakah sudah expired
    if (polling.expiresAt && new Date(polling.expiresAt) < new Date()) {
      redirect("/dashboard/voting?error=Voting+sudah+kadaluarsa");
    }

    await prisma.polling.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userName: session.user.name || session.user.email || "Unknown",
        action: "UPDATE",
        module: "voting",
        targetId: id,
        targetName: polling.judul,
        detail: `Mengubah status menjadi ${!currentStatus ? "Aktif" : "Non-Aktif"}`,
      },
    });

    revalidatePath("/dashboard/voting");
    revalidatePath("/member/voting");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("[TOGGLE_POLLING_ERROR]", error);
    redirect("/dashboard/voting?error=Gagal+mengubah+status");
  }
}

export async function deletePolling(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/login");

  const id = formData.get("id") as string;

  const idValidation = idSchema.safeParse(id);
  if (!idValidation.success) {
    redirect("/dashboard/voting?error=ID+tidak+valid");
  }

  try {
    const polling = await prisma.polling.findUnique({
      where: { id },
      select: { judul: true, _count: { select: { options: true } } },
    });

    if (!polling) {
      redirect("/dashboard/voting?error=Voting+tidak+ditemukan");
    }

    await prisma.polling.delete({ where: { id } });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        userName: session.user.name || session.user.email || "Unknown",
        action: "DELETE",
        module: "voting",
        targetId: id,
        targetName: polling.judul,
        detail: `Menghapus voting beserta semua suara`,
      },
    });

    revalidatePath("/dashboard/voting");
    revalidatePath("/member/voting");
    revalidatePath("/dashboard");
    redirect("/dashboard/voting?deleted=1");
  } catch (error) {
    console.error("[DELETE_POLLING_ERROR]", error);
    redirect("/dashboard/voting?error=Gagal+menghapus+voting");
  }
}
