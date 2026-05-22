# Test Suite — Sistem Informasi Karang Taruna

Folder ini berisi seluruh implementasi pengujian untuk **tugas Mata Kuliah Pengujian dan Pemeliharaan Sistem**.

Dokumen laporan utama: [`docs/LAPORAN_PENGUJIAN_SISTEM.md`](../docs/LAPORAN_PENGUJIAN_SISTEM.md)

## Struktur

```
tests/
├── README.md                       ← file ini
├── unit/
│   ├── utils.test.ts               ← unit test fungsi utility
│   │                                  (calculateSUSScore, getSUSCategory,
│   │                                   slugify, formatCurrency, dll)
│   │
│   └── validations.test.ts         ← unit test schema Zod
│                                       (NIK, email, password, phone,
│                                        SUS, aspirasi, polling)
└── e2e/
    └── anggota-journey.spec.ts     ← skeleton E2E test (Playwright)
```

## Cara Menjalankan

### 1. Setup awal (sekali saja)

```bash
# Install dependency Vitest sebagai dev dependency
npm install -D vitest @vitest/coverage-v8
```

### 2. Jalankan unit test

```bash
npm test
```

Output yang diharapkan:

```
 ✓ tests/unit/utils.test.ts (18 tests) 12ms
 ✓ tests/unit/validations.test.ts (23 tests) 8ms

 Test Files  2 passed (2)
      Tests  41 passed (41)
   Duration  450ms
```

### 3. Jalankan dengan coverage

```bash
npm run test:coverage
```

Coverage report akan tersimpan di folder `coverage/index.html`.

### 4. Mode watch (untuk development)

```bash
npm run test:watch
```

## Pemetaan Test ke Laporan

| File Test | Bagian Laporan |
|---|---|
| `unit/utils.test.ts` → `calculateSUSScore` | Bagian **6 — White Box** & **7 — Unit Testing** |
| `unit/utils.test.ts` → `getSUSCategory` | Bagian **6 — White Box** (cyclomatic complexity) |
| `unit/utils.test.ts` → `slugify`, `truncate`, dll | Bagian **7 — Unit Testing** |
| `unit/validations.test.ts` | Bagian **5 — Black Box** (Equivalence + BVA) |
| `e2e/anggota-journey.spec.ts` | Bagian **9 — System Testing** |

## Total Test Case (Aktual — `npm test`)

| File | Jumlah Test |
|---|---|
| `unit/utils.test.ts` | **31 test** |
| `unit/validations.test.ts` | **35 test** |
| **TOTAL UNIT TEST** | **66 test (semua PASS)** |
| `e2e/anggota-journey.spec.ts` (skeleton) | 7 test |

## Catatan untuk E2E

File `e2e/anggota-journey.spec.ts` adalah **skeleton untuk demonstrasi**. Untuk menjalankannya secara nyata diperlukan:

```bash
npm install -D @playwright/test
npx playwright install
# Pastikan aplikasi running di http://localhost:3000
npx playwright test tests/e2e/
```

Skeleton ini sudah merepresentasikan struktur E2E test yang umum digunakan di industri.
