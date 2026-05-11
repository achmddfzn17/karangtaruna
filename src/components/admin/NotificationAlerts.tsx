import Link from "next/link";
import { Bell, TrendingUp, Calendar } from "lucide-react";

interface NotificationAlertsProps {
  upcomingEvents: number;
  upcomingEventName?: string;
  upcomingEventDate?: Date;
  monthlyTransactions: number;
}

export default function NotificationAlerts({
  upcomingEvents,
  upcomingEventName,
  upcomingEventDate,
  monthlyTransactions,
}: NotificationAlertsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Alert 1: Pengingat Agenda Kegiatan */}
      <Link
        href="/dashboard/kegiatan"
        className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
              ⚠️ Pengingat Agenda Kegiatan
            </h3>
            {upcomingEvents > 0 ? (
              <>
                <p className="text-xs text-amber-700 font-medium mb-2">
                  {upcomingEventName || "Kegiatan mendatang"}
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-bold">
                    {upcomingEventDate
                      ? new Date(upcomingEventDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Segera"}
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                  <span>{upcomingEvents} kegiatan upcoming</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-amber-600 font-medium">
                Tidak ada kegiatan mendatang dalam 7 hari ke depan
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Alert 2: Laporan Keuangan Diperbarui */}
      <Link
        href="/dashboard/keuangan/laporan"
        className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-green-900 mb-1 flex items-center gap-2">
              📊 Laporan Keuangan Diperbarui
            </h3>
            <p className="text-xs text-green-700 font-medium mb-2">
              Transaksi bulan ini telah diperbarui
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
              <span>{monthlyTransactions} transaksi bulan ini</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
