"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditUpdate, auditDelete } from "@/lib/audit";
import { auth } from "@/auth";

export async function deleteTransaksi(id: string) {
  const session = await auth();
  
  // Get transaksi data before delete for audit log
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
  const session = await auth();
  const keterangan = formData.get("keterangan") as string;
  const jumlah = formData.get("jumlah") as string;
  const jenis = formData.get("jenis") as "MASUK" | "KELUAR";
  const tanggal = formData.get("tanggal") as string;
  const kategoriId = formData.get("kategoriId") as string;
  const bukti = formData.get("bukti") as string;

  if (!keterangan || !jumlah || !jenis || !tanggal) {
    throw new Error("Semua field wajib diisi");
  }

  const jumlahNum = parseFloat(jumlah);
  if (isNaN(jumlahNum) || jumlahNum <= 0) {
    throw new Error("Jumlah harus berupa angka positif");
  }

  try {
    await prisma.transaksiKeuangan.update({
      where: { id },
      data: {
        keterangan,
        jumlah: jumlahNum,
        jenis,
        tanggal: new Date(tanggal),
        kategoriId: kategoriId || null,
        bukti: bukti || null,
      },
    });

    // Audit log
    await auditUpdate(
      "keuangan",
      id,
      keterangan,
      session?.user?.id,
      session?.user?.name || undefined,
      `Updated transaksi: ${keterangan} (${jenis}: Rp ${jumlahNum.toLocaleString("id-ID")})`
    );
  } catch {
    throw new Error("Gagal mengupdate transaksi");
  }

  revalidatePath("/dashboard/keuangan");
  redirect("/dashboard/keuangan");
}
