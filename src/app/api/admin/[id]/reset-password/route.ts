import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { auditUpdate } from "@/lib/audit";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/[id]/reset-password
 * Reset password admin - Hanya SUPER_ADMIN
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Hanya Super Admin yang bisa reset password" },
      { status: 403 }
    );
  }

  // Validate ID
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { newPassword } = body;

  // Validate password
  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "Password baru wajib diisi" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 }
    );
  }

  if (newPassword.length > 100) {
    return NextResponse.json(
      { error: "Password maksimal 100 karakter" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Audit log
    await auditUpdate(
      "auth",
      id,
      user.name || user.email,
      session.user.id,
      session.user.name || undefined,
      `Reset password untuk admin: ${user.name || user.email}`
    );

    return NextResponse.json({
      success: true,
      message: `Password admin "${user.name || user.email}" berhasil di-reset`,
    });
  } catch (error) {
    console.error("[RESET_PASSWORD_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal reset password" },
      { status: 500 }
    );
  }
}
