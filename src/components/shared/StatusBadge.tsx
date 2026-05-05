import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

// ─── Type definitions ──────────────────────────────────────────────────────

type StatusAnggota = "AKTIF" | "NON_AKTIF" | "ALUMNI";
type StatusKegiatan = "UPCOMING" | "ONGOING" | "SELESAI" | "DIBATALKAN";
type StatusPublish = "PUBLISHED" | "DRAFT" | "ARCHIVED";
type JenisTransaksi = "MASUK" | "KELUAR";

type AnyStatus = StatusAnggota | StatusKegiatan | StatusPublish | JenisTransaksi;

// ─── Label maps ────────────────────────────────────────────────────────────

const LABELS: Record<AnyStatus, string> = {
  // StatusAnggota
  AKTIF: "Aktif",
  NON_AKTIF: "Non Aktif",
  ALUMNI: "Alumni",
  // StatusKegiatan
  UPCOMING: "Akan Datang",
  ONGOING: "Berlangsung",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
  // StatusPublish
  PUBLISHED: "Dipublikasi",
  DRAFT: "Draft",
  ARCHIVED: "Diarsipkan",
  // JenisTransaksi
  MASUK: "Pemasukan",
  KELUAR: "Pengeluaran",
};

// ─── Variant maps ──────────────────────────────────────────────────────────

const VARIANTS: Record<AnyStatus, BadgeProps["variant"]> = {
  // StatusAnggota
  AKTIF: "success",
  NON_AKTIF: "secondary",
  ALUMNI: "info",
  // StatusKegiatan
  UPCOMING: "default",
  ONGOING: "success",
  SELESAI: "secondary",
  DIBATALKAN: "destructive",
  // StatusPublish
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "secondary",
  // JenisTransaksi
  MASUK: "success",
  KELUAR: "destructive",
};

// ─── Component ─────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = VARIANTS[status] ?? "secondary";
  const label = LABELS[status] ?? status;

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

// ─── Typed convenience exports ─────────────────────────────────────────────

export function AnggotaBadge({ status, className }: { status: StatusAnggota; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function KegiatanBadge({ status, className }: { status: StatusKegiatan; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function PublishBadge({ status, className }: { status: StatusPublish; className?: string }) {
  return <StatusBadge status={status} className={className} />;
}

export function TransaksiBadge({ jenis, className }: { jenis: JenisTransaksi; className?: string }) {
  return <StatusBadge status={jenis} className={className} />;
}
