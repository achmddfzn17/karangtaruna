"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFilesFromStorage } from "@/lib/supabase";
import { auditCreate, auditDelete } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth-helpers";
import { 
  createKegiatanSchema, 
  validateFormData 
} from "@/lib/validations";

export async function createKegiatan(formData: FormData) {
  // ✅ BUG FIX: Add auth check in server action
  const session = await requireAdmin();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, createKegiatanSchema);

  // ✅ Additional validation: tanggalSelesai must be after tanggalMulai
  if (data.tanggalSelesai) {
    const startDate = new Date(data.tanggalMulai);
    const endDate = new Date(data.tanggalSelesai);
    if (endDate < startDate) {
      throw new Error("Tanggal selesai harus setelah tanggal mulai");
    }
  }

  // ✅ Validate anggaran value
  let anggaranValue: number | null = null;
  if (data.anggaran) {
    anggaranValue = parseFloat(data.anggaran);
    if (isNaN(anggaranValue) || anggaranValue < 0) {
      throw new Error("Anggaran harus berupa angka positif");
    }
    if (anggaranValue > 999_999_999) {
      throw new Error("Anggaran terlalu besar (maksimal 999.999.999)");
    }
  }

  let kegiatan;
  try {
    kegiatan = await prisma.kegiatan.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
        jenis: data.jenis,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        lokasi: data.lokasi || null,
        anggaran: anggaranValue,
        status: data.status,
        thumbnail: data.thumbnail || null,
      },
    });

    // Audit log
    await auditCreate(
      "kegiatan",
      kegiatan.id,
      data.nama,
      session.user.id,
      session.user.name || undefined,
      `Created kegiatan: ${data.nama} (${data.jenis}, ${data.status})`
    );
  } catch (error) {
    console.error("[CREATE_KEGIATAN_ERROR]", error);
    throw new Error("Gagal menyimpan data kegiatan");
  }

  revalidatePath("/dashboard/kegiatan");
  revalidatePath("/kegiatan");
  redirect("/dashboard/kegiatan");
}

export async function deleteKegiatan(id: string) {
  // ✅ BUG FIX: Add auth check in server action
  const session = await requireAdmin();
  
  // ✅ BUG FIX: Validate ID format
  if (!id || typeof id !== "string") {
    throw new Error("ID kegiatan tidak valid");
  }

  try {
    // Ambil data kegiatan untuk hapus thumbnail dan galeri dari Supabase
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id },
      select: { 
        thumbnail: true,
        nama: true,
        galeri: {
          select: { url: true }
        }
      },
    });

    if (!kegiatan) {
      throw new Error("Kegiatan tidak ditemukan");
    }

    // Kumpulkan semua URL yang perlu dihapus
    const urlsToDelete: string[] = [];
    
    if (kegiatan.thumbnail) {
      urlsToDelete.push(kegiatan.thumbnail);
    }
    
    if (kegiatan.galeri && kegiatan.galeri.length > 0) {
      urlsToDelete.push(...kegiatan.galeri.map(g => g.url));
    }

    // Hapus semua file dari Supabase Storage
    // ✅ BUG FIX: Catch storage errors but continue with DB deletion
    if (urlsToDelete.length > 0) {
      try {
        await deleteFilesFromStorage(urlsToDelete);
      } catch (storageError) {
        console.error("[STORAGE_DELETE_ERROR]", storageError);
        // Continue with DB deletion even if storage fails
      }
    }

    // Hapus data kegiatan dari database (cascade akan hapus galeri juga)
    await prisma.kegiatan.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "kegiatan",
      id,
      kegiatan.nama,
      session.user.id,
      session.user.name || undefined,
      `Deleted kegiatan: ${kegiatan.nama} (with ${kegiatan.galeri.length} galeri items)`
    );

    revalidatePath("/dashboard/kegiatan");
    revalidatePath("/dashboard/galeri");
    revalidatePath("/kegiatan");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_KEGIATAN_ERROR]", error);
    // ✅ BUG FIX: Preserve original error message if available
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Gagal menghapus kegiatan");
  }
}
