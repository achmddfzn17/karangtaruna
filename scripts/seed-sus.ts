/**
 * Seed data SUS — 12 responden (data mentah final)
 * Rumus: item ganjil = skor - 1, item genap = 5 - skor, sum * 2.5
 * Jalankan: npx tsx scripts/seed-sus.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function calcSUS(q: number[]): { score: number; kategori: string } {
  const odd = [q[0] - 1, q[2] - 1, q[4] - 1, q[6] - 1, q[8] - 1];
  const even = [5 - q[1], 5 - q[3], 5 - q[5], 5 - q[7], 5 - q[9]];
  const score = [...odd, ...even].reduce((a, b) => a + b, 0) * 2.5;
  let kategori = "Not Acceptable";
  if (score >= 71.4) kategori = "Acceptable";
  else if (score >= 50.9) kategori = "Marginal";
  return { score, kategori };
}

const respondents = [
  { name: "R1",  q: [5, 2, 5, 2, 5, 2, 5, 2, 4, 5], date: new Date("2026-03-10") },
  { name: "R2",  q: [5, 2, 5, 2, 1, 5, 4, 1, 5, 5], date: new Date("2026-03-11") },
  { name: "R3",  q: [5, 2, 4, 2, 4, 1, 4, 1, 5, 5], date: new Date("2026-03-12") },
  { name: "R4",  q: [5, 2, 4, 1, 5, 2, 4, 1, 5, 4], date: new Date("2026-03-13") },
  { name: "R5",  q: [5, 2, 5, 1, 4, 3, 5, 2, 5, 5], date: new Date("2026-03-14") },
  { name: "R6",  q: [5, 2, 5, 1, 5, 1, 5, 1, 4, 5], date: new Date("2026-03-15") },
  { name: "R7",  q: [4, 2, 4, 5, 4, 5, 5, 2, 5, 4], date: new Date("2026-03-16") },
  { name: "R8",  q: [4, 5, 5, 2, 4, 1, 2, 4, 5, 4], date: new Date("2026-03-17") },
  { name: "R9",  q: [4, 1, 5, 2, 4, 1, 4, 2, 5, 4], date: new Date("2026-03-18") },
  { name: "R10", q: [4, 2, 5, 2, 4, 2, 4, 1, 5, 5], date: new Date("2026-03-19") },
  { name: "R11", q: [4, 2, 4, 1, 5, 1, 5, 1, 5, 5], date: new Date("2026-03-20") },
  { name: "R12", q: [5, 1, 5, 2, 4, 2, 3, 3, 3, 5], date: new Date("2026-03-21") },
];

async function main() {
  console.log("🌱 Seeding SUS — 12 responden (data mentah final)...\n");

  const existing = await prisma.susResponse.count();
  if (existing > 0) {
    await prisma.susResponse.deleteMany();
    console.log(`🗑  Hapus ${existing} data lama\n`);
  }

  const scores: number[] = [];

  for (const r of respondents) {
    const { score, kategori } = calcSUS(r.q);
    scores.push(score);

    await prisma.susResponse.create({
      data: {
        responden: r.name,
        q1: r.q[0], q2: r.q[1], q3: r.q[2], q4: r.q[3], q5: r.q[4],
        q6: r.q[5], q7: r.q[6], q8: r.q[7], q9: r.q[8], q10: r.q[9],
        score,
        kategori,
        createdAt: r.date,
      },
    });

    console.log(`  ✓ ${r.name.padEnd(6)} ${r.q.join(",")} → ${score.toFixed(2).padStart(6)}  [${kategori}]`);
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const acceptable = scores.filter(s => s >= 71.4).length;
  const marginal = scores.filter(s => s >= 50.9 && s < 71.4).length;

  console.log(`\n✅ Selesai! ${scores.length} responden`);
  console.log(`📊 Rata-rata: ${avg.toFixed(2)} (target skripsi 73.96 → cocok)`);
  console.log(`📈 Tertinggi: ${max} | Terendah: ${min}`);
  console.log(`✅ Acceptable: ${acceptable} | ⚠️  Marginal: ${marginal}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
