"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Bell, Check, CheckCheck, Calendar, Wallet, Vote, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationListProps {
  notifications: Notification[];
}

const typeIcons = {
  kegiatan: Calendar,
  keuangan: Wallet,
  voting: Vote,
  aspirasi: MessageSquare,
  info: Info,
};

const typeColors = {
  kegiatan: "text-blue-600 bg-blue-50",
  keuangan: "text-green-600 bg-green-50",
  voting: "text-purple-600 bg-purple-50",
  aspirasi: "text-orange-600 bg-orange-50",
  info: "text-slate-600 bg-slate-50",
};

export default function NotificationList({ notifications: initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.isRead
  );

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Gagal menandai notifikasi");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast.error("Gagal menandai notifikasi");
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Gagal menandai semua notifikasi");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (error) {
      toast.error("Gagal menandai semua notifikasi");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              filter === "unread"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            Belum Dibaca ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Notification Items */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {filter === "unread"
                ? "Tidak ada notifikasi belum dibaca"
                : "Belum ada notifikasi"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Info;
            const colorClass = typeColors[notification.type as keyof typeof typeColors] || typeColors.info;

            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-white rounded-xl p-4 border transition-all hover:shadow-md",
                  notification.isRead
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/30"
                )}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </p>
                      </div>

                      {/* Mark as Read Button */}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all shrink-0"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
