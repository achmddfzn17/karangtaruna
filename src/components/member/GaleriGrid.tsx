"use client";

import { useState } from "react";
import { X, Download, Calendar, Image as ImageIcon, Video, ZoomIn } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  url: string;
  type: "FOTO" | "VIDEO";
  createdAt: Date;
  kegiatanNama: string;
  kegiatanId: string;
}

interface GaleriGridProps {
  items: GaleriItem[];
}

export default function GaleriGrid({ items }: GaleriGridProps) {
  const [selectedItem, setSelectedItem] = useState<GaleriItem | null>(null);
  const [viewType, setViewType] = useState<"all" | "foto" | "video">("all");

  const filteredItems = items.filter((item) => {
    if (viewType === "all") return true;
    return viewType === "foto" ? item.type === "FOTO" : item.type === "VIDEO";
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <>
      {/* Filter Type */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewType("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            viewType === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          Semua ({items.length})
        </button>
        <button
          onClick={() => setViewType("foto")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            viewType === "foto"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          Foto ({items.filter((i) => i.type === "FOTO").length})
        </button>
        <button
          onClick={() => setViewType("video")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
            viewType === "video"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          )}
        >
          <Video className="w-4 h-4" />
          Video ({items.filter((i) => i.type === "VIDEO").length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              {item.type === "FOTO" ? (
                <img
                  src={item.url}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
                  <Video className="w-16 h-16 text-white/50" />
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              {/* Type Badge */}
              <div className="absolute top-2 right-2">
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                    item.type === "FOTO"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  )}
                >
                  {item.type}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                {item.judul}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                {item.kegiatanNama}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                {format(new Date(item.createdAt), "d MMM yyyy", {
                  locale: localeId,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* Media */}
              <div className="bg-slate-900 flex items-center justify-center max-h-[70vh]">
                {selectedItem.type === "FOTO" ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.judul}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedItem.url}
                    controls
                    className="max-w-full max-h-[70vh]"
                  >
                    Browser Anda tidak mendukung video.
                  </video>
                )}
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                      {selectedItem.judul}
                    </h2>
                    <p className="text-sm text-slate-600 mb-3">
                      {selectedItem.kegiatanNama}
                    </p>
                    {selectedItem.deskripsi && (
                      <p className="text-sm text-slate-600">
                        {selectedItem.deskripsi}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(
                        selectedItem.url,
                        `${selectedItem.judul}.${selectedItem.type === "FOTO" ? "jpg" : "mp4"}`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-semibold shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedItem.createdAt), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItem.type === "FOTO" ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    {selectedItem.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
