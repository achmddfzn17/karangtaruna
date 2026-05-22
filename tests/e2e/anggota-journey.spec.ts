/**
 * E2E Test Skeleton: Anggota Journey
 *
 * Mata Kuliah : Pengujian dan Pemeliharaan Sistem
 * Modul       : System Testing (End-to-End)
 *
 * NOTE: File ini adalah skeleton untuk demonstrasi struktur E2E test
 *       menggunakan Playwright. Untuk menjalankan butuh:
 *
 *   1. npm install -D @playwright/test
 *   2. npx playwright install
 *   3. Aplikasi running di http://localhost:3000
 *   4. npx playwright test tests/e2e/
 */

// @ts-nocheck — file skeleton, dependency Playwright belum terinstall
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("E2E — Journey Anggota Karang Taruna", () => {
  test("E2E-01 | Pengunjung dapat mendaftar sebagai anggota", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Isi form registrasi
    await page.fill('input[name="namaLengkap"]', "Budi Santoso");
    await page.fill('input[name="nik"]', "1234567890123456");
    await page.fill('input[name="email"]', `budi.${Date.now()}@test.id`);
    await page.fill('input[name="password"]', "BudiTest123!");
    await page.fill('input[name="noHp"]', "081234567890");
    await page.selectOption('select[name="jenisKelamin"]', "LAKI_LAKI");

    await page.click('button[type="submit"]');

    // Verifikasi redirect ke login
    await expect(page).toHaveURL(/\/login/);
  });

  test("E2E-02 | Anggota dapat login dan diarahkan ke dashboard", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', "anggota@kt.id");
    await page.fill('input[name="password"]', "Anggota123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/member\/dashboard/);
    await expect(page.locator("h1, h2")).toContainText(/dashboard|selamat/i);
  });

  test("E2E-03 | Anggota tidak dapat login dengan password salah", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', "anggota@kt.id");
    await page.fill('input[name="password"]', "PasswordSalah123");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error, [role=alert]")).toContainText(
      /salah|invalid|tidak/i
    );
  });

  test("E2E-04 | Pengunjung dapat kirim aspirasi tanpa login", async ({ page }) => {
    await page.goto(`${BASE_URL}/aspirasi`);

    await page.fill('input[name="judul"]', "Saran perbaikan jalan");
    await page.fill(
      'textarea[name="pesan"]',
      "Mohon perbaikan jalan menuju balai pertemuan untuk kegiatan rutin."
    );
    await page.click('button[type="submit"]');

    await expect(page.locator("body")).toContainText(/terkirim|sukses|berhasil/i);
  });

  test("E2E-05 | Pengunjung dapat mengisi survei SUS", async ({ page }) => {
    await page.goto(`${BASE_URL}/sus`);

    await page.fill('input[name="responden"]', "Test User");

    // Isi 10 pertanyaan dengan nilai 4
    for (let i = 1; i <= 10; i++) {
      await page.click(`input[name="q${i}"][value="4"]`);
    }

    await page.click('button[type="submit"]');

    // Halaman hasil harus muncul dengan skor
    await expect(page.locator("body")).toContainText(/skor|score|grade/i);
  });
});

test.describe("E2E — Journey Admin", () => {
  test.beforeEach(async ({ page }) => {
    // Login sebagai admin sebelum setiap test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', "admin@kt.id");
    await page.fill('input[name="password"]', "Admin12345!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("E2E-06 | Admin dapat lihat dashboard statistik", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("body")).toContainText(/anggota|kegiatan|saldo/i);
  });

  test("E2E-07 | Admin dapat membuat kegiatan baru", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/kegiatan/tambah`);

    await page.fill('input[name="nama"]', "Bakti Sosial Mei 2026");
    await page.selectOption('select[name="jenis"]', "SOSIAL");
    await page.fill('input[name="tanggalMulai"]', "2026-05-30");
    await page.fill('input[name="lokasi"]', "Balai Desa");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/kegiatan/);
    await expect(page.locator("body")).toContainText("Bakti Sosial Mei 2026");
  });
});
