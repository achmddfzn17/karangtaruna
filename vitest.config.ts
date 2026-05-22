import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest configuration untuk Sistem Informasi Karang Taruna.
 *
 * Mata Kuliah: Pengujian dan Pemeliharaan Sistem.
 *
 * Cara menjalankan:
 *   npm test                  → jalankan semua test sekali
 *   npm run test:watch        → mode watch
 *   npm run test:coverage     → dengan laporan coverage
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/utils.ts", "src/lib/validations.ts"],
      exclude: ["**/node_modules/**", "**/dist/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
