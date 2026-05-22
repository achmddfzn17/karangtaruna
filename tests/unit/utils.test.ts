/**
 * Unit Test: src/lib/utils.ts
 *
 * Mata Kuliah : Pengujian dan Pemeliharaan Sistem
 * Modul       : Utility Functions (perhitungan SUS, formatting, slug)
 *
 * Cara menjalankan:
 *   npm test                  # jalankan sekali
 *   npm run test:watch        # mode watch
 *   npm run test:coverage     # dengan coverage report
 */

import { describe, it, expect } from "vitest";
import {
  calculateSUSScore,
  getSUSCategory,
  slugify,
  truncate,
  formatCurrency,
  getInitials,
  numberToWords,
} from "@/lib/utils";

// ============================================================
// UT-01: calculateSUSScore()
// ============================================================
// Cyclomatic Complexity = 4
// Strategi: cover length-mismatch, best case, worst case, neutral
// ============================================================
describe("calculateSUSScore", () => {
  it("UT-01-A | mengembalikan 0 jika panjang array bukan 10", () => {
    expect(calculateSUSScore([1, 2, 3])).toBe(0);
    expect(calculateSUSScore([])).toBe(0);
    expect(calculateSUSScore(Array(11).fill(3))).toBe(0);
  });

  it("UT-01-B | mengembalikan 100 untuk best-case (positif=5, negatif=1)", () => {
    // Indeks genap (0,2,4,6,8) = positif → score - 1 → max = 4
    // Indeks ganjil (1,3,5,7,9) = negatif → 5 - score → max = 4
    // Total = 40, score = 40 * 2.5 = 100
    expect(calculateSUSScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
  });

  it("UT-01-C | mengembalikan 0 untuk worst-case", () => {
    expect(calculateSUSScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
  });

  it("UT-01-D | mengembalikan 50 untuk jawaban netral (semua 3)", () => {
    expect(calculateSUSScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });

  it("UT-01-E | menghitung dengan benar untuk pola variasi", () => {
    // [4, 2, 4, 2, 4, 2, 4, 2, 4, 2]
    // genap: (4-1)*5 = 15, ganjil: (5-2)*5 = 15, total 30, *2.5 = 75
    expect(calculateSUSScore([4, 2, 4, 2, 4, 2, 4, 2, 4, 2])).toBe(75);
  });

  it("UT-01-F | menghasilkan angka antara 0 dan 100 inklusif", () => {
    const score = calculateSUSScore([3, 4, 5, 1, 2, 3, 4, 2, 5, 1]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ============================================================
// UT-02: getSUSCategory()
// ============================================================
// Cyclomatic Complexity = 6 → minimal 6 test path
// ============================================================
describe("getSUSCategory", () => {
  it("UT-02-A | score >= 90 → grade A+", () => {
    expect(getSUSCategory(95).grade).toBe("A+");
    expect(getSUSCategory(100).grade).toBe("A+");
  });

  it("UT-02-B | 80 <= score < 90 → grade A", () => {
    expect(getSUSCategory(85).grade).toBe("A");
    expect(getSUSCategory(80).grade).toBe("A"); // boundary
  });

  it("UT-02-C | 70 <= score < 80 → grade B", () => {
    expect(getSUSCategory(75).grade).toBe("B");
    expect(getSUSCategory(70).grade).toBe("B"); // boundary
  });

  it("UT-02-D | 60 <= score < 70 → grade C", () => {
    expect(getSUSCategory(65).grade).toBe("C");
    expect(getSUSCategory(60).grade).toBe("C"); // boundary
  });

  it("UT-02-E | 50 <= score < 60 → grade D", () => {
    expect(getSUSCategory(55).grade).toBe("D");
    expect(getSUSCategory(50).grade).toBe("D"); // boundary
  });

  it("UT-02-F | score < 50 → grade F", () => {
    expect(getSUSCategory(30).grade).toBe("F");
    expect(getSUSCategory(0).grade).toBe("F");
    expect(getSUSCategory(49).grade).toBe("F");
  });

  it("UT-02-G | mengembalikan struktur lengkap (label, color, grade)", () => {
    const result = getSUSCategory(75);
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("color");
    expect(result).toHaveProperty("grade");
    expect(typeof result.color).toBe("string");
    expect(result.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

// ============================================================
// UT-03: slugify()
// ============================================================
describe("slugify", () => {
  it("UT-03-A | mengubah teks biasa menjadi slug", () => {
    expect(slugify("Berita Karang Taruna")).toBe("berita-karang-taruna");
  });

  it("UT-03-B | menangani huruf kapital", () => {
    expect(slugify("HALO DUNIA")).toBe("halo-dunia");
  });

  it("UT-03-C | menghapus karakter spesial", () => {
    expect(slugify("Halo, Dunia!")).toBe("halo-dunia");
    expect(slugify("Test @#$%^& Special")).toBe("test-special");
  });

  it("UT-03-D | menormalisasi karakter beraksen", () => {
    expect(slugify("Café résumé naïve")).toBe("cafe-resume-naive");
  });

  it("UT-03-E | menghapus dash di awal/akhir", () => {
    expect(slugify("---hello---")).toBe("hello");
    expect(slugify("   spasi   ")).toBe("spasi");
  });
});

// ============================================================
// UT-04: formatCurrency()
// ============================================================
describe("formatCurrency", () => {
  it("UT-04-A | format Rupiah standar", () => {
    const result = formatCurrency(1500000);
    // Locale id-ID menggunakan format "Rp 1.500.000" (non-breaking space)
    expect(result).toMatch(/Rp.+1\.500\.000/);
  });

  it("UT-04-B | format angka 0", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/Rp.+0/);
  });

  it("UT-04-C | format angka negatif", () => {
    const result = formatCurrency(-50000);
    expect(result).toContain("-");
    expect(result).toContain("50.000");
  });

  it("UT-04-D | tidak menampilkan desimal (currency Rupiah)", () => {
    const result = formatCurrency(1234.56);
    // Tidak boleh ada koma atau decimal
    expect(result).not.toMatch(/,\d/);
  });
});

// ============================================================
// UT-05: truncate()
// ============================================================
describe("truncate", () => {
  it("UT-05-A | text lebih panjang dari limit dipotong dan diberi ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("UT-05-B | text kurang dari limit tidak diubah", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });

  it("UT-05-C | text tepat di batas tidak ditambah ellipsis", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });
});

// ============================================================
// UT-06: getInitials()
// ============================================================
describe("getInitials", () => {
  it("UT-06-A | mengambil inisial dari nama 2 kata", () => {
    expect(getInitials("Budi Santoso")).toBe("BS");
  });

  it("UT-06-B | maksimal 2 huruf untuk nama panjang", () => {
    expect(getInitials("Achmad Daffa Faizan")).toBe("AD");
  });

  it("UT-06-C | nama satu kata", () => {
    expect(getInitials("Budi")).toBe("B");
  });
});

// ============================================================
// UT-07: numberToWords()
// ============================================================
describe("numberToWords", () => {
  it("UT-07-A | < 1000 dikembalikan apa adanya", () => {
    expect(numberToWords(500)).toBe("500");
  });

  it("UT-07-B | >= 1000 → format Rb", () => {
    expect(numberToWords(1500)).toBe("1.5 Rb");
  });

  it("UT-07-C | >= 1.000.000 → format Jt", () => {
    expect(numberToWords(2500000)).toBe("2.5 Jt");
  });
});
