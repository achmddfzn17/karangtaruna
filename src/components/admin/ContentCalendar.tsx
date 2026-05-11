"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  type: "kegiatan" | "berita" | "artikel";
  startDate: string;
  endDate: string;
  color?: string;
  jenis?: string;
  status?: string;
  lokasi?: string;
}

export function ContentCalendar() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [month, year]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar/events?month=${month}&year=${year}`);
      if (!res.ok) {
        throw new Error("Gagal memuat event kalender");
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m - 1, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month - 1 &&
        eventDate.getFullYear() === year
      );
    });
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const today = new Date();
  const isCurrentDay = (day: number) => 
    today.getDate() === day && 
    today.getMonth() === month - 1 && 
    today.getFullYear() === year;

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  // Map type to color class
  const getEventColorClass = (type: string) => {
    switch (type) {
      case "kegiatan":
        return "bg-blue-500 hover:bg-blue-600";
      case "berita":
        return "bg-green-500 hover:bg-green-600";
      case "artikel":
        return "bg-slate-500 hover:bg-slate-600";
      default:
        return "bg-slate-400 hover:bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-extrabold text-slate-900">
          {monthNames[month - 1]} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
            aria-label="Bulan sebelumnya"
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            disabled={isLoading}
          >
            Hari Ini
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
            aria-label="Bulan berikutnya"
            disabled={isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">Gagal Memuat Kalender</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-2 text-xs font-bold text-red-700 hover:text-red-900 underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && !error && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-blue-50 to-slate-50">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, idx) => (
              <div
                key={day}
                className={`p-3 text-center font-bold text-xs uppercase tracking-wider border-b border-slate-200 ${
                  idx === 0 ? "text-red-600" : "text-slate-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {emptyDays.map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="p-3 bg-slate-50/50 min-h-[120px] border-r border-b border-slate-100 last:border-r-0" 
              />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isCurrentDay(day);
              
              return (
                <div
                  key={day}
                  className={`p-2.5 min-h-[120px] border-r border-b border-slate-100 last:border-r-0 transition-colors ${
                    isToday ? "bg-blue-50/50" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mb-2 text-sm font-bold ${
                      isToday 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-700"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <Link
                        key={i}
                        href={
                          event.type === "kegiatan"
                            ? `/dashboard/kegiatan`
                            : event.type === "berita"
                            ? `/dashboard/berita`
                            : `/dashboard/artikel`
                        }
                      >
                        <div
                          className={`text-[10px] px-2 py-1 rounded-md text-white font-bold cursor-pointer truncate transition-all hover:opacity-90 ${getEventColorClass(event.type)}`}
                          title={`${event.title}${event.lokasi ? ` - ${event.lokasi}` : ""}`}
                        >
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-500 font-semibold px-2">
                        +{dayEvents.length - 3} event lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">
            Tidak ada event di bulan {monthNames[month - 1]} {year}
          </p>
        </div>
      )}
    </div>
  );
}
