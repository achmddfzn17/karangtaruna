import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import SusDashboard from "./SusDashboard";

export const metadata = { title: "Kuisioner SUS" };

export default async function SusAdminPage() {
  const responses = await prisma.susResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Hitung statistik
  const total = responses.length;
  const avgScore = total > 0
    ? responses.reduce((sum, r) => sum + r.score, 0) / total
    : 0;

  const acceptable = responses.filter((r) => r.score >= 71.4).length;
  const marginal = responses.filter((r) => r.score >= 50.9 && r.score < 71.4).length;
  const notAcceptable = responses.filter((r) => r.score < 50.9).length;

  // Distribusi skor per rentang (untuk histogram)
  const distribution = [
    { range: "0–25", count: responses.filter((r) => r.score < 25).length },
    { range: "25–50", count: responses.filter((r) => r.score >= 25 && r.score < 50).length },
    { range: "50–62.5", count: responses.filter((r) => r.score >= 50 && r.score < 62.5).length },
    { range: "62.5–71.4", count: responses.filter((r) => r.score >= 62.5 && r.score < 71.4).length },
    { range: "71.4–85", count: responses.filter((r) => r.score >= 71.4 && r.score < 85).length },
    { range: "85–100", count: responses.filter((r) => r.score >= 85).length },
  ];

  // Rata-rata per pertanyaan
  const avgPerQ = total > 0
    ? Array.from({ length: 10 }, (_, i) => {
        const key = `q${i + 1}` as keyof typeof responses[0];
        return responses.reduce((sum, r) => sum + (r[key] as number), 0) / total;
      })
    : Array(10).fill(0);

  // Server action: hapus response
  async function deleteResponse(id: string) {
    "use server";
    await prisma.susResponse.delete({ where: { id } });
    revalidatePath("/dashboard/sus");
  }

  return (
    <SusDashboard
      responses={responses}
      stats={{ total, avgScore, acceptable, marginal, notAcceptable }}
      distribution={distribution}
      avgPerQ={avgPerQ}
      deleteResponse={deleteResponse}
    />
  );
}
