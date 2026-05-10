"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditUpdate, auditDelete } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  updateTransaksiSchema, 
  validateFormData 
} from "@/lib/validations";

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
