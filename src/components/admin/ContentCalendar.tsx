"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    fetchEvents();
  }, [month, year]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/calendar/events?month=${month}&year=${year}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {monthNames[month - 1]} {year}
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (month === 1) {
                  setMonth(12);
                  setYear(year - 1);
                } else {
                  setMonth(month - 1);
                }
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const today = new Date();
                setMonth(today.getMonth() + 1);
                setYear(today.getFullYear());
              }}
            >
              Hari Ini
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (month === 12) {
                  setMonth(1);
                  setYear(year + 1);
                } else {
                  setMonth(month + 1);
                }
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-slate-100">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-sm border-b"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="p-3 bg-gray-50 min-h-[120px]" />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className="p-3 min-h-[120px] border border-gray-200 hover:bg-blue-50"
                >
                  <div className="font-semibold text-sm mb-2">{day}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <Link
                        key={i}
                        href={
                          event.type === "kegiatan"
                            ? `/dashboard/kegiatan#${event.id}`
                            : `/dashboard/${event.type}#${event.id}`
                        }
                      >
                        <div
                          className="text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 truncate"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} event
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Kegiatan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>Berita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span>Artikel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
