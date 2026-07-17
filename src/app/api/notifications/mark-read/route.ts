import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    const userId = session.user.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID notifikasi tidak valid" },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
