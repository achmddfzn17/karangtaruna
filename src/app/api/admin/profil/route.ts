import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { admin: true },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    admin: user.admin
      ? { jabatan: user.admin.jabatan, phone: user.admin.phone }
      : null,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { name, jabatan, phone } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
  });

  const existingAdmin = await prisma.admin.findUnique({ where: { userId } });
  if (existingAdmin) {
    await prisma.admin.update({
      where: { userId },
      data: { jabatan: jabatan || null, phone: phone || null },
    });
  } else {
    await prisma.admin.create({
      data: { userId, jabatan: jabatan || null, phone: phone || null },
    });
  }

  return NextResponse.json({ success: true });
}
