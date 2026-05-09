import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST — anggota daftar ke kegiatan
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { kegiatanId } = await req.json();

  if (!kegiatanId) return NextResponse.json({ error: "kegiatanId wajib diisi" }, { status: 400 });

  // Cari anggota berdasarkan userId
  const anggota = await prisma.anggota.findUnique({ where: { userId } });
  if (!anggota) return NextResponse.json({ error: "Data anggota tidak ditemukan" }, { status: 404 });

  // Cek kegiatan masih bisa didaftar
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
  if (!kegiatan) return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
  if (kegiatan.status === "SELESAI" || kegiatan.status === "DIBATALKAN") {
    return NextResponse.json({ error: "Kegiatan sudah tidak bisa didaftar" }, { status: 400 });
  }

  // Cek sudah terdaftar
  const existing = await prisma.anggotaKegiatan.findUnique({
    where: { anggotaId_kegiatanId: { anggotaId: anggota.id, kegiatanId } },
  });
  if (existing) return NextResponse.json({ error: "Sudah terdaftar di kegiatan ini" }, { status: 400 });

  await prisma.anggotaKegiatan.create({
    data: { anggotaId: anggota.id, kegiatanId },
  });

  return NextResponse.json({ success: true });
}

// DELETE — anggota batalkan pendaftaran
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { kegiatanId } = await req.json();

  const anggota = await prisma.anggota.findUnique({ where: { userId } });
  if (!anggota) return NextResponse.json({ error: "Data anggota tidak ditemukan" }, { status: 404 });

  // Hanya bisa batalkan jika kegiatan belum selesai
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
  if (kegiatan?.status === "SELESAI") {
    return NextResponse.json({ error: "Tidak bisa membatalkan kegiatan yang sudah selesai" }, { status: 400 });
  }

  await prisma.anggotaKegiatan.deleteMany({
    where: { anggotaId: anggota.id, kegiatanId },
  });

  return NextResponse.json({ success: true });
}
