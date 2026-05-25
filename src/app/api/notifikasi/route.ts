import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET — ambil notifikasi milik user yang login
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const notifs = await prisma.notification.findMany({
    where: {
      OR: [
        { userId },
        { userId: null },
      ],
    },
    include: {
      reads: {
        where: { userId },
        select: { userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      OR: [
        { userId, isRead: false },
        {
          userId: null,
          reads: {
            none: { userId },
          },
        },
      ],
    },
  });

  return NextResponse.json({
    notifs: notifs.map(({ reads, ...notification }) => ({
      ...notification,
      isRead: notification.userId ? notification.isRead : reads.length > 0,
    })),
    unreadCount,
  });
}

// PATCH — tandai semua sebagai sudah dibaca
export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const userNotifications = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  const broadcastNotifications = await prisma.notification.findMany({
    where: {
      userId: null,
      reads: {
        none: { userId },
      },
    },
    select: { id: true },
  });

  if (broadcastNotifications.length > 0) {
    await prisma.notificationRead.createMany({
      data: broadcastNotifications.map((notification) => ({
        notificationId: notification.id,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({
    success: true,
    updated: userNotifications.count + broadcastNotifications.length,
  });
}
