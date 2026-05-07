import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // e.g. "/dashboard/anggota?status=AKTIF"
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const separator = baseUrl.includes("?") ? "&" : "?";

  // Tampilkan max 5 halaman di sekitar current
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}${separator}page=${currentPage - 1}`}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Prev
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-slate-400 text-sm font-bold">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={`${baseUrl}${separator}page=${p}`}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              p === currentPage
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}${separator}page=${currentPage + 1}`}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-300 cursor-not-allowed">
          Next
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
