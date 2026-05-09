import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const susSchema = z.object({
  responden: z.string().min(1, "Nama wajib diisi"),
  q1: z.number().min(1).max(5),
  q2: z.number().min(1).max(5),
  q3: z.number().min(1).max(5),
  q4: z.number().min(1).max(5),
  q5: z.number().min(1).max(5),
  q6: z.number().min(1).max(5),
  q7: z.number().min(1).max(5),
  q8: z.number().min(1).max(5),
  q9: z.number().min(1).max(5),
  q10: z.number().min(1).max(5),
});

export async function POST(req: Request) {
  try {
    // SECURITY: Add authentication to prevent spam/DoS
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - login diperlukan" }, { status: 401 });
    }

    const userId = session.user.id;

    // SECURITY: Check if user already submitted SUS today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingToday = await prisma.susResponse.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingToday) {
      return NextResponse.json(
        { error: "Anda sudah mengisi survey SUS hari ini" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = susSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate SUS Score
    // Odd questions: scale position - 1
    const q1Score = data.q1 - 1;
    const q3Score = data.q3 - 1;
    const q5Score = data.q5 - 1;
    const q7Score = data.q7 - 1;
    const q9Score = data.q9 - 1;

    // Even questions: 5 - scale position
    const q2Score = 5 - data.q2;
    const q4Score = 5 - data.q4;
    const q6Score = 5 - data.q6;
    const q8Score = 5 - data.q8;
    const q10Score = 5 - data.q10;

    const sumScore =
      q1Score +
      q2Score +
      q3Score +
      q4Score +
      q5Score +
      q6Score +
      q7Score +
      q8Score +
      q9Score +
      q10Score;

    const totalScore = sumScore * 2.5;

    // Determine category based on Bangor, Kortum, and Miller (2009)
    let kategori = "Not Acceptable";
    if (totalScore >= 71.4) kategori = "Acceptable";
    else if (totalScore >= 50.9) kategori = "Marginal";

    const susResponse = await prisma.susResponse.create({
      data: {
        userId,
        responden: data.responden,
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        q6: data.q6,
        q7: data.q7,
        q8: data.q8,
        q9: data.q9,
        q10: data.q10,
        score: totalScore,
        kategori: kategori,
      },
    });

    return NextResponse.json({ success: true, data: susResponse });
  } catch (error) {
    console.error("[SUS_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal menyimpan evaluasi" },
      { status: 500 }
    );
  }
}
