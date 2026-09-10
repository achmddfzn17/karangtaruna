"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { createPollingSchema } from "@/lib/validations";

const idSchema = z.string().cuid("ID tidak valid");

export async function createPolling(formData: FormData) {
  const session = await requireAdmin();

  // ✅ VALIDATE INPUT with centralized schema
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

  let redirectUrl = "";

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
        userId: session.user.id,
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
    redirectUrl = "/dashboard/voting?success=1";
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[CREATE_POLLING_ERROR]", error);
    redirectUrl = "/dashboard/voting?error=Gagal+membuat+voting";
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

export async function togglePollingStatus(formData: FormData) {
  const session = await requireAdmin();
  const currentStatus = formData.get("currentStatus") === "true";

  const idValidation = idSchema.safeParse(id);
  if (!idValidation.success) {
    redirect("/dashboard/voting?error=ID+tidak+valid");
  }

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
      userId: session.user.id,
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
}

export async function deletePolling(formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id") as string;

  const idValidation = idSchema.safeParse(id);
  if (!idValidation.success) {
    redirect("/dashboard/voting?error=ID+tidak+valid");
  }

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
      userId: session.user.id,
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
}
