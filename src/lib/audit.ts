import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type AuditAction = 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "LOGIN" 
  | "LOGOUT" 
  | "VOTE" 
  | "REPLY" 
  | "UPLOAD" 
  | "DOWNLOAD";

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
  | "auth" 
  | "sus";

interface AuditLogParams {
  userId?: string;
  userName?: string;
  action: AuditAction;
  module: AuditModule;
  targetId?: string;
  targetName?: string;
  detail?: string;
}

/**
 * Create audit log entry
 * Logs all important CRUD operations and user actions
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    // Get IP address from headers
    const headersList = await headers();
    const ipAddress = 
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || null,
        action: params.action,
        module: params.module,
        targetId: params.targetId || null,
        targetName: params.targetName || null,
        detail: params.detail || null,
        ipAddress,
      },
    });
  } catch (error) {
    // Don't throw error - audit logging should not break the main operation
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}

/**
 * Helper to create audit log for CREATE operations
 */
export async function auditCreate(
  module: AuditModule,
  targetId: string,
  targetName: string,
  userId?: string,
  userName?: string,
  detail?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userName,
    action: "CREATE",
    module,
    targetId,
    targetName,
    detail,
  });
}

/**
 * Helper to create audit log for UPDATE operations
 */
export async function auditUpdate(
  module: AuditModule,
  targetId: string,
  targetName: string,
  userId?: string,
  userName?: string,
  detail?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userName,
    action: "UPDATE",
    module,
    targetId,
    targetName,
    detail,
  });
}

/**
 * Helper to create audit log for DELETE operations
 */
export async function auditDelete(
  module: AuditModule,
  targetId: string,
  targetName: string,
  userId?: string,
  userName?: string,
  detail?: string
): Promise<void> {
  await createAuditLog({
    userId,
    userName,
    action: "DELETE",
    module,
    targetId,
    targetName,
    detail,
  });
}
