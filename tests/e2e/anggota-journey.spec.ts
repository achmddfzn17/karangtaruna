/**
 * End-to-end checks for the Karang Taruna application.
 *
 * Use a dedicated test environment/database. Never commit real credentials.
 * Optional login scenarios are skipped unless their E2E_* environment
 * variables are configured.
 */
import { test, expect } from "@playwright/test";

const anggotaEmail = process.env.E2E_ANGGOTA_EMAIL;
const anggotaPassword = process.env.E2E_ANGGOTA_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("E2E — Halaman publik", () => {
  test("E2E-01 | Pengunjung dapat membuka halaman beranda", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Karang Taruna\s+Muda Berkarya/i })).toBeVisible();
  });

  test("E2E-03 | Login anggota menampilkan pesan saat kredensial tidak valid", async ({ page }) => {
    await page.goto("/anggota/login");
    await page.getByPlaceholder("Masukkan email Anda").fill(
      anggotaEmail ?? "nonexistent-e2e-user@example.invalid",
    );
    await page.getByPlaceholder("••••••••").fill("Invalid-Test-Password-Only");
    await page.getByRole("button", { name: /^Login$/ }).click();

    await expect(page.getByText("Email atau password salah", { exact: true })).toBeVisible();
  });

  test("E2E-04 | Halaman aspirasi publik menampilkan formulir", async ({ page }) => {
    await page.goto("/aspirasi");

    await expect(page.getByRole("heading", { name: "Kirim Aspirasi" })).toBeVisible();
    await expect(page.locator('input[name="judul"]')).toBeVisible();
    await expect(page.locator('textarea[name="pesan"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Kirim Aspirasi/i })).toBeVisible();
  });

  test("E2E-05 | Halaman SUS menampilkan sepuluh pertanyaan", async ({ page }) => {
    await page.goto("/sus");

    await expect(page.getByRole("heading", { name: /System Usability Scale/i })).toBeVisible();
    await expect(page.locator("h3")).toHaveCount(10);
    await expect(page.getByPlaceholder("Masukkan nama Anda...")).toBeVisible();
    await expect(page.getByRole("button", { name: /Kirim Evaluasi/i })).toBeVisible();
  });
});

test.describe("E2E — Anggota terautentikasi", () => {
  test("E2E-02 | Anggota yang valid diarahkan ke dashboard anggota", async ({ page }) => {
    test.skip(
      !anggotaEmail || !anggotaPassword,
      "Atur E2E_ANGGOTA_EMAIL dan E2E_ANGGOTA_PASSWORD untuk menjalankan skenario ini.",
    );

    await page.goto("/anggota/login");
    await page.getByPlaceholder("Masukkan email Anda").fill(anggotaEmail!);
    await page.getByPlaceholder("••••••••").fill(anggotaPassword!);
    await page.getByRole("button", { name: /^Login$/ }).click();

    await expect(page).toHaveURL(/\/member\/dashboard(?:\/|$)/);
    await expect(page.locator("body")).toContainText(/dashboard|selamat|kegiatan/i);
  });
});

test.describe("E2E — Administrator terautentikasi", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !adminEmail || !adminPassword,
      "Atur E2E_ADMIN_EMAIL dan E2E_ADMIN_PASSWORD untuk menjalankan skenario admin.",
    );

    await page.goto("/login");
    await page.getByPlaceholder("Masukkan email admin").fill(adminEmail!);
    await page.getByPlaceholder("••••••••").fill(adminPassword!);
    await page.getByRole("button", { name: /^Login$/ }).click();
    await expect(page).toHaveURL(/\/dashboard(?:\/|$)/);
  });

  test("E2E-06 | Administrator dapat membuka dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("body")).toContainText(/anggota|kegiatan|keuangan/i);
  });

  test("E2E-07 | Administrator dapat membuka manajemen kegiatan", async ({ page }) => {
    await page.goto("/dashboard/kegiatan");

    await expect(page.getByRole("heading", { name: "Manajemen Data Kegiatan" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Tambah Kegiatan Baru|Tambah Kegiatan/i }).first()).toBeVisible();
  });
});