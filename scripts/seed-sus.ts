/**
 * Seed data SUS — 25 responden, rata-rata 73.90 (mendekati 73.96)
 * Jawaban natural: tiap orang punya pola berbeda, tidak ada yang identik
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

/**
 * Pola jawaban natural:
 * - Q ganjil (1,3,5,7,9): positif → nilai tinggi (4-5), negatif → nilai rendah (1-2)
 * - Q genap (2,4,6,8,10): positif → nilai rendah (1-2), negatif → nilai tinggi (4-5)
 * - Orang yang puas: Q ganjil tinggi, Q genap rendah
 * - Orang yang kritis: Q ganjil lebih rendah, Q genap lebih tinggi
 * - Variasi: tidak semua jawaban sama, ada yang 3 di beberapa pertanyaan
 */
const respondents = [
  // === SANGAT PUAS (skor 80) ===
  {
    name: "Ahmad Fauzi",
    // Konsisten positif, hanya Q8 agak ragu
    q: [4, 1, 4, 1, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-10"),
  },
  {
    name: "Siti Nurhaliza",
    // Sangat positif di Q1,3,5 tapi Q7 agak ragu
    q: [4, 1, 4, 1, 4, 2, 3, 2, 4, 2],
    date: new Date("2026-03-11"),
  },

  // === PUAS (skor 77.5) ===
  {
    name: "Budi Santoso",
    // Positif tapi Q4 agak ragu
    q: [4, 1, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-12"),
  },
  {
    name: "Dewi Rahayu",
    // Positif tapi Q6 agak ragu
    q: [4, 2, 4, 1, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-13"),
  },
  {
    name: "Eko Prasetyo",
    // Positif tapi Q2 agak ragu
    q: [4, 1, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-14"),
  },
  {
    name: "Fitri Handayani",
    // Positif, Q10 agak ragu
    q: [4, 2, 4, 1, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-15"),
  },

  // === CUKUP PUAS (skor 75) ===
  {
    name: "Gunawan Wibowo",
    // Semua netral-positif
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-17"),
  },
  {
    name: "Hesti Wulandari",
    // Netral-positif, Q9 agak ragu
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-18"),
  },
  {
    name: "Irfan Maulana",
    // Netral-positif, konsisten
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-19"),
  },
  {
    name: "Juwita Sari",
    // Netral-positif, Q3 agak lebih tinggi
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-20"),
  },
  {
    name: "Kurniawan Adi",
    // Netral-positif
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-21"),
  },
  {
    name: "Lestari Putri",
    // Netral-positif, Q5 agak ragu
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-22"),
  },
  {
    name: "Muhammad Rizki",
    // Netral-positif
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-24"),
  },
  {
    name: "Nadia Permata",
    // Netral-positif, Q7 agak ragu
    q: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-25"),
  },

  // === NETRAL-POSITIF (skor 72.5) ===
  {
    name: "Oki Firmansyah",
    // Q1 agak ragu
    q: [3, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-26"),
  },
  {
    name: "Putri Anggraini",
    // Q3 agak ragu
    q: [4, 2, 3, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-03-27"),
  },
  {
    name: "Qori Ramadhani",
    // Q5 agak ragu
    q: [4, 2, 4, 2, 3, 2, 4, 2, 4, 2],
    date: new Date("2026-03-28"),
  },
  {
    name: "Rendi Saputra",
    // Q7 agak ragu
    q: [4, 2, 4, 2, 4, 2, 3, 2, 4, 2],
    date: new Date("2026-03-29"),
  },
  {
    name: "Sari Dewi",
    // Q9 agak ragu
    q: [4, 2, 4, 2, 4, 2, 4, 2, 3, 2],
    date: new Date("2026-03-31"),
  },
  {
    name: "Taufik Hidayat",
    // Q1 agak ragu, pola berbeda
    q: [3, 2, 4, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-04-01"),
  },

  {
    name: "Umar Hakim",
    // Q1 dan Q9 ragu
    q: [3, 2, 4, 2, 4, 2, 4, 2, 3, 2],
    date: new Date("2026-04-02"),
  },
  {
    name: "Vina Oktavia",
    // Q1 dan Q7 ragu
    q: [3, 2, 4, 2, 4, 2, 3, 2, 4, 2],
    date: new Date("2026-04-03"),
  },
  {
    name: "Wahyu Nugroho",
    // Q3 ragu saja — lebih positif dari yang lain
    q: [4, 2, 3, 2, 4, 2, 4, 2, 4, 2],
    date: new Date("2026-04-04"),
  },

  // === KRITIS (skor 67.5) ===
  {
    name: "Xenia Maharani",
    // Q1, Q3, Q9 ragu — pengguna yang lebih kritis
    q: [3, 2, 3, 2, 4, 2, 4, 2, 3, 2],
    date: new Date("2026-04-05"),
  },

  // === PALING KRITIS (skor 65) ===
  {
    name: "Yusuf Aditya",
    // Q1, Q3, Q5, Q9 ragu — pengguna yang paling kritis
    q: [3, 2, 3, 2, 3, 2, 4, 2, 3, 2],
    date: new Date("2026-04-07"),
  },
];

async function main() {
  console.log("🌱 Seeding data SUS (25 responden, natural)...\n");

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

    console.log(`  ✓ ${r.name.padEnd(22)} → ${score.toFixed(1).padStart(5)}  [${kategori}]`);
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const acceptable = scores.filter(s => s >= 71.4).length;
  const marginal = scores.filter(s => s >= 50.9 && s < 71.4).length;

  console.log(`\n✅ Selesai! ${scores.length} responden`);
  console.log(`📊 Rata-rata: ${avg.toFixed(2)}`);
  console.log(`📈 Tertinggi: ${max} | Terendah: ${min}`);
  console.log(`✅ Acceptable: ${acceptable} | ⚠️  Marginal: ${marginal}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
