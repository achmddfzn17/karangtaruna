import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/notifications/mark-all-read
 * Mark all unread notifications as read for the current user
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const updated = userNotifications.count + broadcastNotifications.length;

    return NextResponse.json({ 
      success: true,
      updated,
      message: `${updated} notifikasi ditandai sebagai sudah dibaca`,
    });
  } catch (error) {
    console.error("[MARK_ALL_READ_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal menandai notifikasi sebagai sudah dibaca" },
      { status: 500 }
    );
  }
}
