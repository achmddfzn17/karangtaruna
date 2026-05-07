import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  const userId = (session.user as any).id;
  
  // Only ADMIN/SUPER_ADMIN can fetch any anggota
  // ANGGOTA can only fetch their own data
  if (userRole === "ANGGOTA") {
    const userAnggota = await prisma.anggota.findUnique({ where: { userId } });
    const { id } = await params;
    if (!userAnggota || userAnggota.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const anggota = await prisma.anggota.findUnique({ where: { id } });
  if (!anggota) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(anggota);
}
