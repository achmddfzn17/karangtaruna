import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  // SECURITY: Only ADMIN/SUPER_ADMIN can create gallery items
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden - hanya admin yang bisa membuat galeri" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { judul, url, type, deskripsi, kegiatanId } = body;

    if (!judul || !url || !type) {
      return NextResponse.json({ error: "Data tidak lengkap - judul, url, dan type wajib diisi" }, { status: 400 });
    }

    // SECURITY: Validate type is one of allowed values
    if (!["FOTO", "VIDEO"].includes(type)) {
      return NextResponse.json({ error: "Type harus FOTO atau VIDEO" }, { status: 400 });
    }

    // SECURITY: If kegiatanId provided, verify it exists
    if (kegiatanId) {
      const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
      if (!kegiatan) {
        return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
      }
    }

    const item = await prisma.galeriItem.create({
      data: {
        judul,
        url,
        type,
        deskripsi: deskripsi || null,
        kegiatanId: kegiatanId || null,
      },
    });

    revalidatePath("/dashboard/galeri");
    revalidatePath("/galeri");

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[GALERI_POST_ERROR]", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
