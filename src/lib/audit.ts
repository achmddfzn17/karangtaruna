import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PUBLISH"
  | "ARCHIVE"
  | "TOGGLE";

export type AuditModule =
  | "anggota"
  | "kegiatan"
  | "program"
  | "berita"
  | "artikel"
  | "galeri"
  | "keuangan"
  | "aspirasi"
  | "voting"
  | "admin"
  | "sus"
  | "auth";

interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  action: AuditAction;
  module: AuditModule;
  targetId?: string | null;
  targetName?: string | null;
  detail?: string | null;
  ipAddress?: string | null;
}

/**
 * Catat aktivitas ke audit log.
 * Fire-and-forget — tidak throw jika gagal agar tidak mengganggu operasi utama.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userName: params.userName ?? null,
        action: params.action,
        module: params.module,
        targetId: params.targetId ?? null,
        targetName: params.targetName ?? null,
        detail: params.detail ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch {
    // Jangan throw — audit log tidak boleh mengganggu operasi utama
  }
}
