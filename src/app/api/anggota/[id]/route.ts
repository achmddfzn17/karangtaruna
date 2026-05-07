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

  const { id } = await params;

  const anggota = await prisma.anggota.findUnique({ where: { id } });
  if (!anggota) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(anggota);
}
