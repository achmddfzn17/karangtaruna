import { auth } from "@/auth";
import prisma from "@/lib/prisma";
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

    // Update all unread notifications for this user
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ 
      success: true,
      updated: result.count,
      message: `${result.count} notifikasi ditandai sebagai sudah dibaca`,
    });
  } catch (error) {
    console.error("[MARK_ALL_READ_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal menandai notifikasi sebagai sudah dibaca" },
      { status: 500 }
    );
  }
}
