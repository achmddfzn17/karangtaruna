import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH — tandai satu notifikasi sebagai dibaca
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { userId: null },
      ],
    },
    select: { id: true, userId: true },
  });

  if (!notification) {
    return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
  }

  if (notification.userId === null) {
    await prisma.notificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId: notification.id,
          userId,
        },
      },
      update: { readAt: new Date() },
      create: {
        notificationId: notification.id,
        userId,
      },
    });
  } else {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE — hapus satu notifikasi
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  const result = await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
