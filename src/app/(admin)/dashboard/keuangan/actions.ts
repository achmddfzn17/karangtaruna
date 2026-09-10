"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditCreate, auditUpdate, auditDelete } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-helpers";
import { 
  createTransaksiSchema,
  updateTransaksiSchema, 
  createKategoriSchema,
  updateKategoriSchema,
  validateFormData 
} from "@/lib/validations";

export async function createTransaksi(formData: FormData) {
  const session = await requireAdmin();
  const data = validateFormData(formData, createTransaksiSchema);

  try {
    const transaksi = await prisma.transaksiKeuangan.create({
      data: {
        keterangan: data.keterangan,
        jumlah: parseFloat(data.jumlah),
        jenis: data.jenis,
        tanggal: new Date(data.tanggal),
        kategoriId: data.kategoriId || null,
        bukti: data.bukti || null,
      },
    });

    await auditCreate(
      "keuangan",
      transaksi.id,
      transaksi.keterangan,
      session?.user?.id,
      session?.user?.name || undefined
    );
  } catch (error) {
    console.error("[CREATE_TRANSAKSI_ERROR]", error);
    throw new Error("Gagal membuat transaksi");
  }

  revalidatePath("/dashboard/keuangan");
  redirect("/dashboard/keuangan");
}

export async function createKategori(formData: FormData) {
  const session = await requireAdmin();
  const data = validateFormData(formData, createKategoriSchema);

  try {
    const kategori = await prisma.kategoriTransaksi.create({
      data: {
        nama: data.nama,
        jenis: data.jenis,
        keterangan: data.keterangan || null,
      },
    });

    await auditCreate(
      "keuangan",
      kategori.id,
      data.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Created kategori transaksi: ${data.nama} (${data.jenis})`
    );
  } catch (error) {
    console.error("[CREATE_KATEGORI_ERROR]", error);
    throw new Error("Gagal membuat kategori");
  }

  revalidatePath("/dashboard/keuangan/kategori");
  revalidatePath("/dashboard/keuangan");
  redirect("/dashboard/keuangan/kategori");
}

export async function updateKategori(id: string, formData: FormData) {
  const session = await requireAdmin();

  if (!id || typeof id !== "string") {
    throw new Error("ID kategori tidak valid");
  }

  const data = validateFormData(formData, updateKategoriSchema);

  try {
    await prisma.kategoriTransaksi.update({
      where: { id },
      data: {
        nama: data.nama,
        jenis: data.jenis,
        keterangan: data.keterangan || null,
      },
    });

    await auditUpdate(
      "keuangan",
      id,
      data.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Updated kategori transaksi: ${data.nama} (${data.jenis})`
    );
  } catch (error) {
    console.error("[UPDATE_KATEGORI_ERROR]", error);
    throw new Error("Gagal mengupdate kategori");
  }

  revalidatePath("/dashboard/keuangan/kategori");
  revalidatePath("/dashboard/keuangan");
  redirect("/dashboard/keuangan/kategori");
}

export async function deleteTransaksi(id: string) {
  const session = await requireAdmin();
  const transaksi = await prisma.transaksiKeuangan.findUnique({
    where: { id },
    select: { keterangan: true, jumlah: true, jenis: true },
  });

  if (!transaksi) {
    throw new Error("Transaksi tidak ditemukan");
  }

  try {
    await prisma.transaksiKeuangan.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "keuangan",
      id,
      transaksi.keterangan,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted transaksi: ${transaksi.keterangan} (${transaksi.jenis}: Rp ${transaksi.jumlah.toLocaleString("id-ID")})`
    );
  } catch {
    throw new Error("Gagal menghapus transaksi");
  }
  revalidatePath("/dashboard/keuangan");
}

export async function updateTransaksi(id: string, formData: FormData) {
  const session = await requireAdmin();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, updateTransaksiSchema);
  
  const jumlahNum = parseFloat(data.jumlah);

  try {
    await prisma.transaksiKeuangan.update({
      where: { id },
      data: {
        keterangan: data.keterangan,
        jumlah: jumlahNum,
        jenis: data.jenis,
        tanggal: new Date(data.tanggal),
        kategoriId: data.kategoriId || null,
        bukti: data.bukti || null,
      },
    });

    // Audit log
    await auditUpdate(
      "keuangan",
      id,
      data.keterangan,
      session?.user?.id,
      session?.user?.name || undefined,
      `Updated transaksi: ${data.keterangan} (${data.jenis}: Rp ${jumlahNum.toLocaleString("id-ID")})`
    );
  } catch (error) {
    console.error("[UPDATE_TRANSAKSI_ERROR]", error);
    throw new Error("Gagal mengupdate transaksi");
  }

  revalidatePath("/dashboard/keuangan");
  redirect("/dashboard/keuangan");
}
