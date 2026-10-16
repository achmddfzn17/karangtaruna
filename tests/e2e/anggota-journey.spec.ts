/**
 * End-to-end test scenarios for the Karang Taruna application.
 *
 * Login credentials must be provided via environment variables. Do not put
 * working credentials, tokens, or production personal data in this file.
 * These tests should run only against a dedicated test database/environment.
 */
import { test, expect } from "@playwright/test";

const ANGGOTA_EMAIL = process.env.E2E_ANGGOTA_EMAIL;
const ANGGOTA_PASSWORD = process.env.E2E_ANGGOTA_PASSWORD;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("E2E — Journey Anggota Karang Taruna", () => {
  test("E2E-01 | Pengunjung dapat membuka halaman pendaftaran", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator('input[name="namaLengkap"]')).toBeVisible();
  });

  test("E2E-02 | Anggota dapat login dan diarahkan ke dashboard", async ({ page }) => {
    test.skip(
      !ANGGOTA_EMAIL || !ANGGOTA_PASSWORD,
      "Atur E2E_ANGGOTA_EMAIL dan E2E_ANGGOTA_PASSWORD untuk menjalankan skenario login anggota.",
    );

    await page.goto("/login");
    await page.fill('input[name="email"]', ANGGOTA_EMAIL!);
    await page.fill('input[name="password"]', ANGGOTA_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/member\/dashboard/);
    await expect(page.locator("h1, h2")).toContainText(/dashboard|selamat/i);
  });

  test("E2E-03 | Login ditolak untuk akun yang tidak dikenal", async ({ page }) => {
    await page.goto("/login");
    await page.fill(
      'input[name="email"]',
      ANGGOTA_EMAIL ?? "nonexistent-e2e-user@example.invalid",
    );
    await page.fill('input[name="password"]', "Invalid-Test-Password-Only");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error, [role=alert]")).toContainText(
      /salah|invalid|tidak|gagal/i,
    );
  });

  test("E2E-04 | Halaman aspirasi publik dapat dibuka", async ({ page }) => {
    await page.goto("/aspirasi");
    await expect(page.locator("body")).toBeVisible();
  });

  test("E2E-05 | Halaman survei SUS dapat dibuka", async ({ page }) => {
    await page.goto("/sus");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("E2E — Journey Admin", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !ADMIN_EMAIL || !ADMIN_PASSWORD,
      "Atur E2E_ADMIN_EMAIL dan E2E_ADMIN_PASSWORD dengan akun admin khusus pengujian.",
    );

    await page.goto("/login");
    await page.fill('input[name="email"]', ADMIN_EMAIL!);
    await page.fill('input[name="password"]', ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("E2E-06 | Admin dapat melihat dashboard statistik", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("body")).toContainText(/anggota|kegiatan|saldo/i);
  });

  test("E2E-07 | Dashboard pengelolaan kegiatan dapat dibuka", async ({ page }) => {
    await page.goto("/dashboard/kegiatan");
    await expect(page.locator("body")).toBeVisible();
  });
});
