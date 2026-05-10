"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromStorage, deleteFilesFromStorage } from "@/lib/supabase";
import { auditCreate, auditDelete } from "@/lib/audit";
import { auth } from "@/auth";
import { 
  createKegiatanSchema, 
  validateFormData 
} from "@/lib/validations";

export async function createKegiatan(formData: FormData) {
  const session = await auth();
  
  // ✅ VALIDATE INPUT with centralized schema
  const data = validateFormData(formData, createKegiatanSchema);

  try {
    const kegiatan = await prisma.kegiatan.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi || null,
        jenis: data.jenis,
        tanggalMulai: new Date(data.tanggalMulai),
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : null,
        lokasi: data.lokasi || null,
        anggaran: data.anggaran ? parseFloat(data.anggaran) : null,
        status: data.status,
        thumbnail: data.thumbnail || null,
      },
    });

    // Audit log
    await auditCreate(
      "kegiatan",
      kegiatan.id,
      data.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Created kegiatan: ${data.nama} (${data.jenis}, ${data.status})`
    );
  } catch (error) {
    console.error("[CREATE_KEGIATAN_ERROR]", error);
    throw new Error("Gagal menyimpan data kegiatan");
  }

  revalidatePath("/dashboard/kegiatan");
  redirect("/dashboard/kegiatan");
}

export async function deleteKegiatan(id: string) {
  const session = await auth();
  
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
    if (urlsToDelete.length > 0) {
      await deleteFilesFromStorage(urlsToDelete);
    }

    // Hapus data kegiatan dari database (cascade akan hapus galeri juga)
    await prisma.kegiatan.delete({ where: { id } });

    // Audit log
    await auditDelete(
      "kegiatan",
      id,
      kegiatan.nama,
      session?.user?.id,
      session?.user?.name || undefined,
      `Deleted kegiatan: ${kegiatan.nama} (with ${kegiatan.galeri.length} galeri items)`
    );

    revalidatePath("/dashboard/kegiatan");
    revalidatePath("/dashboard/galeri");
    revalidatePath("/");
  } catch (error) {
    console.error("[DELETE_KEGIATAN_ERROR]", error);
    throw new Error("Gagal menghapus kegiatan");
  }
}
