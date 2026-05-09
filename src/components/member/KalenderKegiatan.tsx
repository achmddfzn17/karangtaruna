"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string | null;
  description?: string | null;
  status: string;
  isRegistered: boolean;
}

interface KalenderKegiatanProps {
  events: Event[];
}

export default function KalenderKegiatan({ events }: KalenderKegiatanProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for selected date
  const selectedEvents = selectedDate
    ? events.filter((e) => isSameDay(new Date(e.start), selectedDate))
    : [];

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => isSameDay(new Date(e.start), day));
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            {format(currentMonth, "MMMM yyyy", { locale: localeId })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square p-2 rounded-lg text-sm font-semibold transition-all relative",
                  isTodayDate && "ring-2 ring-blue-500",
                  isSelected && "bg-blue-600 text-white",
                  !isSelected && isTodayDate && "bg-blue-50 text-blue-600",
                  !isSelected && !isTodayDate && hasEvents && "bg-green-50 text-green-700 hover:bg-green-100",
                  !isSelected && !isTodayDate && !hasEvents && "text-slate-600 hover:bg-slate-50"
                )}
              >
                {format(day, "d")}
                {hasEvents && !isSelected && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-green-500"
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-600">Hari Ini</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-600">Ada Kegiatan</span>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          {selectedDate
            ? `Kegiatan ${format(selectedDate, "d MMMM yyyy", { locale: localeId })}`
            : "Pilih Tanggal"}
        </h3>

        {selectedDate ? (
          selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {event.title}
                    </h4>
                    {event.isRegistered && (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.start), "HH:mm", { locale: localeId })}
                  </div>

                  {event.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <button
                    className={cn(
                      "w-full mt-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                      event.isRegistered
                        ? "bg-green-100 text-green-700 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                    disabled={event.isRegistered}
                  >
                    {event.isRegistered ? "Sudah Terdaftar" : "Daftar Kegiatan"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">
                Tidak ada kegiatan pada tanggal ini
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
              Klik tanggal di kalender untuk melihat kegiatan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
