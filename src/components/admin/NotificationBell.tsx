"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-blue-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
};

const typeBg: Record<string, string> = {
  info: "bg-blue-50",
  warning: "bg-amber-50",
  success: "bg-green-50",
  error: "bg-red-50",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifikasi");
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifs);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    // Poll setiap 30 detik
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifikasi", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifikasi/${id}`, { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notifikasi/${id}`, { method: "DELETE" });
    const deleted = notifs.find((n) => n.id === id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    if (deleted && !deleted.isRead) setUnread((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) markAllRead();
        }}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-800">Notifikasi</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-extrabold rounded-full">
                  {unread} baru
                </span>
              )}
            </div>
            {notifs.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${typeBg[n.type] || typeBg.info}`}>
                    {typeIcon[n.type] || typeIcon.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <button
                      onClick={(e) => deleteNotif(n.id, e)}
                      className="p-1 text-slate-300 hover:text-red-400 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
