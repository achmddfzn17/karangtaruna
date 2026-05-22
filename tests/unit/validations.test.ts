/**
 * Unit Test: src/lib/validations.ts
 *
 * Mata Kuliah : Pengujian dan Pemeliharaan Sistem
 * Modul       : Schema Validation (Zod)
 *
 * Strategi:
 *   - Equivalence Partitioning untuk kelas valid/invalid
 *   - Boundary Value Analysis untuk panjang min/max
 */

import { describe, it, expect } from "vitest";
import {
  nikSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  slugSchema,
  susResponseSchema,
  createAspirasiSchema,
  createPollingSchema,
} from "@/lib/validations";

// ============================================================
// UT-08: nikSchema (NIK = 16 digit angka)
// ============================================================
describe("nikSchema", () => {
  it("UT-08-A | NIK valid 16 digit angka", () => {
    expect(nikSchema.safeParse("1234567890123456").success).toBe(true);
  });

  it("UT-08-B | NIK 15 digit (boundary just below) ditolak", () => {
    expect(nikSchema.safeParse("123456789012345").success).toBe(false);
  });

  it("UT-08-C | NIK 17 digit (boundary just above) ditolak", () => {
    expect(nikSchema.safeParse("12345678901234567").success).toBe(false);
  });

  it("UT-08-D | NIK mengandung huruf ditolak", () => {
    expect(nikSchema.safeParse("1234567890ABCDEF").success).toBe(false);
  });

  it("UT-08-E | NIK kosong ditolak", () => {
    expect(nikSchema.safeParse("").success).toBe(false);
  });
});

// ============================================================
// UT-09: emailSchema
// ============================================================
describe("emailSchema", () => {
  it("UT-09-A | email format valid", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("admin@karangtaruna.id").success).toBe(true);
  });

  it("UT-09-B | email tanpa @ ditolak", () => {
    expect(emailSchema.safeParse("invalidemail.com").success).toBe(false);
  });

  it("UT-09-C | email tanpa domain ditolak", () => {
    expect(emailSchema.safeParse("user@").success).toBe(false);
  });

  it("UT-09-D | email kosong ditolak", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });
});

// ============================================================
// UT-10: passwordSchema (min 8, max 100)
// ============================================================
describe("passwordSchema", () => {
  it("UT-10-A | password 7 karakter ditolak (just below min)", () => {
    expect(passwordSchema.safeParse("Abc123!").success).toBe(false);
  });

  it("UT-10-B | password 8 karakter diterima (boundary min)", () => {
    expect(passwordSchema.safeParse("Abc123!8").success).toBe(true);
  });

  it("UT-10-C | password 100 karakter diterima (boundary max)", () => {
    expect(passwordSchema.safeParse("a".repeat(100)).success).toBe(true);
  });

  it("UT-10-D | password 101 karakter ditolak (just above max)", () => {
    expect(passwordSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});

// ============================================================
// UT-11: phoneSchema (HP Indonesia)
// ============================================================
describe("phoneSchema", () => {
  it("UT-11-A | HP diawali 08 valid", () => {
    expect(phoneSchema.safeParse("081234567890").success).toBe(true);
  });

  it("UT-11-B | HP diawali +62 valid", () => {
    expect(phoneSchema.safeParse("+6281234567890").success).toBe(true);
  });

  it("UT-11-C | HP diawali angka selain 0 ditolak", () => {
    expect(phoneSchema.safeParse("181234567890").success).toBe(false);
  });

  it("UT-11-D | HP terlalu pendek ditolak", () => {
    expect(phoneSchema.safeParse("0812345").success).toBe(false);
  });

  it("UT-11-E | HP mengandung huruf ditolak", () => {
    expect(phoneSchema.safeParse("0812ABCDE678").success).toBe(false);
  });
});

// ============================================================
// UT-12: slugSchema
// ============================================================
describe("slugSchema", () => {
  it("UT-12-A | slug valid huruf-kecil-dengan-dash", () => {
    expect(slugSchema.safeParse("berita-karang-taruna").success).toBe(true);
  });

  it("UT-12-B | slug dengan huruf besar ditolak", () => {
    expect(slugSchema.safeParse("Berita-Salah").success).toBe(false);
  });

  it("UT-12-C | slug dengan spasi ditolak", () => {
    expect(slugSchema.safeParse("berita salah").success).toBe(false);
  });

  it("UT-12-D | slug terlalu pendek (< 3) ditolak", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false);
  });
});

// ============================================================
// UT-13: susResponseSchema (skala 1-5 untuk q1-q10)
// ============================================================
describe("susResponseSchema", () => {
  const validResponse = {
    responden: "Budi Santoso",
    q1: 4, q2: 2, q3: 5, q4: 1, q5: 4,
    q6: 2, q7: 5, q8: 1, q9: 4, q10: 2,
  };

  it("UT-13-A | response valid lengkap diterima", () => {
    expect(susResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("UT-13-B | nilai q < 1 ditolak", () => {
    expect(susResponseSchema.safeParse({ ...validResponse, q1: 0 }).success).toBe(false);
  });

  it("UT-13-C | nilai q > 5 ditolak", () => {
    expect(susResponseSchema.safeParse({ ...validResponse, q5: 6 }).success).toBe(false);
  });

  it("UT-13-D | responden kosong ditolak", () => {
    expect(susResponseSchema.safeParse({ ...validResponse, responden: "" }).success).toBe(false);
  });

  it("UT-13-E | nilai boundary 1 dan 5 diterima", () => {
    const allOnes = { ...validResponse, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1 };
    const allFives = { ...validResponse, q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5 };
    expect(susResponseSchema.safeParse(allOnes).success).toBe(true);
    expect(susResponseSchema.safeParse(allFives).success).toBe(true);
  });
});

// ============================================================
// UT-14: createAspirasiSchema
// ============================================================
describe("createAspirasiSchema", () => {
  it("UT-14-A | aspirasi valid lengkap", () => {
    const data = {
      nama: "Anonim",
      judul: "Saran fasilitas balai",
      pesan: "Mohon perbaikan jalan menuju balai pertemuan karang taruna.",
      kategori: "Saran",
    };
    expect(createAspirasiSchema.safeParse(data).success).toBe(true);
  });

  it("UT-14-B | judul terlalu pendek (< 5) ditolak", () => {
    const data = { judul: "Test", pesan: "Pesan yang cukup panjang nih untuk lolos validasi minimum." };
    expect(createAspirasiSchema.safeParse(data).success).toBe(false);
  });

  it("UT-14-C | pesan terlalu pendek (< 10) ditolak", () => {
    const data = { judul: "Judul cukup", pesan: "Pendek" };
    expect(createAspirasiSchema.safeParse(data).success).toBe(false);
  });

  it("UT-14-D | nama kosong tetap diterima (anonim)", () => {
    const data = {
      nama: "",
      judul: "Saran fasilitas",
      pesan: "Pesan yang cukup panjang untuk validasi.",
    };
    expect(createAspirasiSchema.safeParse(data).success).toBe(true);
  });
});

// ============================================================
// UT-15: createPollingSchema
// ============================================================
describe("createPollingSchema", () => {
  it("UT-15-A | polling valid dengan 3 opsi unik", () => {
    const data = {
      judul: "Pemilihan Ketua 2026",
      deskripsi: "Pilih ketua karang taruna",
      options: "Budi, Andi, Citra",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(createPollingSchema.safeParse(data).success).toBe(true);
  });

  it("UT-15-B | polling dengan opsi duplikat ditolak", () => {
    const data = {
      judul: "Pemilihan Ketua",
      options: "Budi, Andi, Budi",
    };
    expect(createPollingSchema.safeParse(data).success).toBe(false);
  });

  it("UT-15-C | polling dengan kurang dari 2 opsi ditolak", () => {
    const data = { judul: "Pemilihan", options: "Budi" };
    expect(createPollingSchema.safeParse(data).success).toBe(false);
  });

  it("UT-15-D | tanggal kadaluarsa di masa lalu ditolak", () => {
    const data = {
      judul: "Pemilihan Ketua",
      options: "Budi, Andi",
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(createPollingSchema.safeParse(data).success).toBe(false);
  });
});
