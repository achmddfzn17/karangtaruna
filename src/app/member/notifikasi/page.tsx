import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import NotificationList from "@/components/member/NotificationList";
import { Bell } from "lucide-react";

export const metadata = {
  title: "Notifikasi | Portal Anggota",
};

export default async function NotifikasiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/anggota/login");

  // Fetch notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-600" />
            Notifikasi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0
              ? `Anda memiliki ${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
      </div>

      {/* Notification List */}
      <NotificationList notifications={notifications} />
    </div>
  );
}
