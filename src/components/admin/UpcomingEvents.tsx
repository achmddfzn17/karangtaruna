import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";

interface Event {
  id: string;
  nama: string;
  jenis: string;
  tanggalMulai: Date;
  lokasi: string | null;
  thumbnail: string | null;
  _count?: {
    peserta: number;
  };
}

interface UpcomingEventsProps {
  events: Event[];
}

const jenisColors: Record<string, string> = {
  SOSIAL: "bg-green-100 text-green-700 border-green-200",
  PENDIDIKAN: "bg-blue-100 text-blue-700 border-blue-200",
  EKONOMI: "bg-purple-100 text-purple-700 border-purple-200",
  OLAHRAGA: "bg-orange-100 text-orange-700 border-orange-200",
  SENI_BUDAYA: "bg-pink-100 text-pink-700 border-pink-200",
  LAINNYA: "bg-slate-100 text-slate-700 border-slate-200",
};

const jenisGradients: Record<string, string> = {
  SOSIAL: "from-green-400 to-green-600",
  PENDIDIKAN: "from-blue-400 to-blue-600",
  EKONOMI: "from-purple-400 to-purple-600",
  OLAHRAGA: "from-orange-400 to-orange-600",
  SENI_BUDAYA: "from-pink-400 to-pink-600",
  LAINNYA: "from-slate-400 to-slate-600",
};

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
          <Calendar className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-base font-bold text-slate-900 mb-1">Tidak Ada Kegiatan Mendatang</p>
        <p className="text-sm text-slate-500">Kegiatan upcoming akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-100">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Agenda Kegiatan Mendatang</h2>
              <p className="text-xs text-slate-500">{events.length} kegiatan upcoming</p>
            </div>
          </div>
          <Link
            href="/dashboard/kegiatan"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/kegiatan/peserta/${event.id}`}
              className="group flex-shrink-0 w-72 bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br overflow-hidden">
                {event.thumbnail ? (
                  <Image
                    src={event.thumbnail}
                    alt={event.nama}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${
                      jenisGradients[event.jenis] || jenisGradients.LAINNYA
                    } flex items-center justify-center`}
                  >
                    <Calendar className="w-16 h-16 text-white opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Badge Jenis */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm ${
                      jenisColors[event.jenis] || jenisColors.LAINNYA
                    }`}
                  >
                    {event.jenis.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {event.nama}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">
                      {new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {event.lokasi && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span className="font-medium line-clamp-1">{event.lokasi}</span>
                    </div>
                  )}

                  {event._count && event._count.peserta > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5 text-green-500" />
                      <span className="font-medium">{event._count.peserta} peserta</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    Lihat Detail →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
