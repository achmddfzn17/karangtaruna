"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  FileSpreadsheet,
  FileText,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonTableRow } from "@/components/ui/skeleton";

// ─── Props ─────────────────────────────────────────────────────────────────

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  totalItems?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
}

// ─── Debounce hook ─────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = "Cari...",
  onSearch,
  searchValue: externalSearch,
  totalItems,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onExportExcel,
  onExportPDF,
  filterSlot,
  actionSlot,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [localSearch, setLocalSearch] = React.useState(externalSearch ?? "");

  const debouncedSearch = useDebounce(localSearch, 300);

  // Propagate debounced search to parent
  React.useEffect(() => {
    onSearch?.(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep in sync with external controlled value
  React.useEffect(() => {
    if (externalSearch !== undefined && externalSearch !== localSearch) {
      setLocalSearch(externalSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSearch]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
  });

  const totalPages = totalItems !== undefined ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = totalItems !== undefined && totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = totalItems !== undefined ? Math.min(page * pageSize, totalItems) : data.length;

  // Page number buttons (max 5 around current)
  const pageNumbers = React.useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }, [page, totalPages]);

  const PAGE_SIZE_OPTIONS = ["10", "25", "50", "100"];

  return (
    <div className="space-y-4">
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {onSearch !== undefined && (
            <div className="relative w-full sm:w-64">
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="pr-3"
              />
            </div>
          )}
          {filterSlot}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onExportExcel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              leftIcon={<FileSpreadsheet className="h-4 w-4 text-success" />}
            >
              Excel
            </Button>
          )}
          {onExportPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              leftIcon={<FileText className="h-4 w-4 text-destructive" />}
            >
              PDF
            </Button>
          )}
          {actionSlot}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border bg-muted/50"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className={cn(
                          "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                          canSort && "cursor-pointer select-none hover:text-foreground transition-colors duration-150"
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-muted-foreground/50">
                              {sorted === "asc" ? (
                                <ChevronUp className="h-3 w-3 text-primary" />
                              ) : sorted === "desc" ? (
                                <ChevronDown className="h-3 w-3 text-primary" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTableRow
                      key={i}
                      columns={columns.length}
                    />
                  ))}
                </>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted">
                        <Inbox className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Tidak ada data</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {localSearch
                            ? `Tidak ada hasil untuk "${localSearch}"`
                            : "Belum ada data yang tersedia"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/40 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-foreground whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      {(onPageChange || onPageSizeChange) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Info */}
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            {isLoading
              ? "Memuat data..."
              : totalItems !== undefined && totalItems > 0
              ? `Menampilkan ${startItem}–${endItem} dari ${totalItems.toLocaleString("id-ID")} data`
              : "Tidak ada data"}
          </p>

          <div className="flex items-center gap-3 order-1 sm:order-2 flex-wrap">
            {/* Page size */}
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Baris:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <SelectTrigger className="h-8 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page buttons */}
            {onPageChange && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(1)}
                  disabled={page <= 1 || isLoading}
                  aria-label="Halaman pertama"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                {pageNumbers.map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => onPageChange(p)}
                    disabled={isLoading}
                    className={cn("text-xs", p === page && "pointer-events-none")}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page >= totalPages || isLoading}
                  aria-label="Halaman terakhir"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
