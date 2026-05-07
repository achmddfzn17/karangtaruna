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
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { judul, url, type, deskripsi, kegiatanId } = body;

    if (!judul || !url || !type) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
