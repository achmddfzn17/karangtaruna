# CLAUDE.md

Panduan untuk Claude Code (dan agen AI lain) saat bekerja di repositori ini. Ikuti dokumen ini sebelum menulis atau mengubah kode.

## Ringkasan Proyek

Sistem Informasi Karang Taruna Muda Berkarya. Aplikasi web full-stack untuk mengelola keanggotaan, kegiatan, keuangan, dan konten organisasi kepemudaan. Ini adalah proyek skripsi, jadi kestabilan, kejelasan kode, dan kemudahan penjelasan lebih penting daripada trik canggih.

Baca `PRD.md` untuk kebutuhan produk, `desain.md` untuk sistem desain, `AGENTS.md` untuk cara kerja agen, dan `skill.md` untuk metodologi kerja.

## Tech Stack

- Next.js 16.2.4 (App Router) dan React 19.2.4
- TypeScript mode strict
- Prisma 7.8.0 dengan PostgreSQL, memakai driver adapter `@prisma/adapter-pg` di atas `pg` Pool
- NextAuth v5 (`next-auth ^5.0.0-beta.31`) dengan adapter Prisma, strategi sesi JWT, hashing bcryptjs
- Tailwind CSS v4 dan komponen Radix UI (pola shadcn/ui)
- Zustand (state global), Zod (validasi), React Hook Form
- Supabase Storage (upload berkas), Resend (email)
- Recharts (grafik), TipTap (rich text), jspdf dan jspdf-autotable (PDF), xlsx (ekspor Excel)
- Vitest (unit). Playwright (e2e) baru berupa kerangka skenario dan belum terpasang sebagai dependency

## Perintah Penting

```bash
npm run dev            # jalankan server pengembangan
npm run build          # build produksi (memakai webpack lewat flag --webpack)
npm run start          # jalankan hasil build
npm run lint           # ESLint
npm run test           # Vitest sekali jalan
npm run test:watch     # Vitest mode watch
npm run test:coverage  # Vitest dengan coverage
npx prisma generate    # generate Prisma Client (juga jalan saat postinstall)
npx prisma db push     # sinkronkan skema ke database (dipakai untuk baseline skema)
npx prisma studio      # GUI database
npx tsx scripts/<nama>.ts   # jalankan skrip seed atau utilitas
```

Selalu jalankan `npm run lint` dan `npm run test` sebelum menyatakan pekerjaan selesai. Untuk perubahan yang menyentuh tipe atau rute, jalankan juga `npm run build`. Catatan: `build` memakai flag `--webpack` walaupun `next.config.ts` menyertakan konfigurasi Turbopack.

## Struktur Folder

```
src/
  app/
    (public)/      halaman publik: beranda, tentang, berita, artikel, galeri, kegiatan, program, aspirasi, sus
    (auth)/        halaman login admin (/login) dan login anggota (/anggota/login)
    (admin)/       dashboard admin di segmen /dashboard (dilindungi peran ADMIN/SUPER_ADMIN)
    member/        portal anggota di segmen /member (dilindungi peran ANGGOTA)
    api/           route handler (REST-style) per modul, 26 berkas route.ts
    verify/        verifikasi sertifikat publik lewat nomor sertifikat
    layout.tsx     root layout global (font Geist, ThemeProvider)
  components/
    admin/  member/  public/  shared/  ui/
  lib/             helper: prisma, auth-helpers, audit, sanitize, validations, api-helpers,
                   supabase, email, logger, certificate, certificate-pdf, safe-query, utils
  store/           store Zustand (useAppStore)
  types/           tipe TypeScript dan augmentasi next-auth
  contexts/        provider React (ThemeProvider)
  auth.ts          konfigurasi NextAuth lengkap (Prisma, bcrypt, callback)
  auth.config.ts   konfigurasi NextAuth edge-safe (tanpa Prisma) untuk proxy
  proxy.ts         pengganti middleware di Next.js 16, proteksi rute berbasis peran
prisma/            schema.prisma dan folder migrations
prisma.config.ts   konfigurasi path skema dan url migrasi (di akar repo)
scripts/           skrip seed dan utilitas yang dijalankan dengan tsx
tests/             unit (vitest) dan e2e (kerangka playwright)
```

Total halaman (`page.tsx`) sekitar 69 berkas dan endpoint API (`route.ts`) sebanyak 26 berkas. Banyak aksi tulis di area admin tidak lewat API route, melainkan lewat Server Actions pada berkas `actions.ts` di dalam folder `(admin)/dashboard`.

## Konvensi Arsitektur

Route group memakai kurung, yaitu `(public)`, `(auth)`, dan `(admin)`. Kurung tidak menambah segmen URL, hanya mengelompokkan layout.

Default memakai Server Component. Tambahkan `"use client"` hanya bila komponen butuh state, efek, atau event handler browser. Komponen interaktif diberi akhiran atau lokasi yang jelas, misalnya tombol hapus ada di `components/admin/Delete*Button.tsx`.

Route handler ada di `src/app/api/<modul>/route.ts`. Gunakan helper di `src/lib/api-helpers.ts` untuk respons yang konsisten dan `src/lib/auth-helpers.ts` untuk cek sesi dan peran. Jangan mengulang logika autentikasi manual di tiap route.

Sebagian besar mutasi di area admin justru memakai Server Actions, bukan API route. Berkas `actions.ts` dengan direktif `"use server"` tersebar di folder `(admin)/dashboard`, misalnya `anggota/actions.ts`, `berita/actions.ts`, `keuangan/actions.ts`, dan `voting/actions.ts`. Pola ini normal untuk App Router, jadi cek dulu apakah sebuah fitur memakai action atau route sebelum menambah endpoint baru.

Fitur e-voting adalah contoh yang seluruh mutasinya (membuat polling dan mengirim suara) memakai Server Action bertransaksi, tanpa API route khusus.

Setiap aksi tulis yang penting (create, update, delete) harus mencatat audit lewat `src/lib/audit.ts`.

## Konvensi Kode

- Bahasa domain memakai istilah Indonesia (anggota, kegiatan, keuangan, iuran, aspirasi). Pertahankan penamaan ini agar konsisten dengan skema database dan URL.
- Validasi semua input dengan skema Zod yang sudah ada di `src/lib/validations.ts`. Tambah skema baru di sana, jangan buat validasi ad hoc di dalam komponen.
- Sanitasi konten HTML dari editor rich text memakai `src/lib/sanitize.ts` sebelum disimpan atau ditampilkan.
- Impor Prisma Client dari `src/lib/prisma.ts` (singleton), jangan membuat instance baru.
- Utilitas kelas Tailwind memakai `cn()` dari `src/lib/utils.ts`.
- Ikuti token warna dan komponen di `desain.md`. Jangan menaruh warna hex acak di komponen, pakai variabel tema.

## Database

Skema tunggal ada di `prisma/schema.prisma` dengan PostgreSQL. Ada 24 model dan 9 enum. Model utama: User, Account, Session, VerificationToken, Admin, Anggota, Kegiatan, AnggotaKegiatan, Sertifikat, Program, Berita, Artikel, GaleriItem, KategoriTransaksi, TransaksiKeuangan, SusResponse, Notification, NotificationRead, Aspirasi, Polling, PollingOption, Vote, IuranAnggota, AuditLog. Semua model memakai id `cuid()`, kecuali VerificationToken yang memakai kunci komposit.

Blok `datasource db` di schema tidak memuat baris `url`. Koneksi disuntikkan lewat driver adapter saat runtime (`src/lib/prisma.ts`) dan lewat `prisma.config.ts` untuk keperluan migrasi (`DIRECT_URL ?? DATABASE_URL`). Ini pola sah untuk Prisma 7 dengan driver adapter.

Baseline skema tampaknya dibuat lewat `npx prisma db push`, bukan migrasi bertahap. Folder `prisma/migrations` hanya berisi satu migrasi (`add_notification_reads`). Untuk perubahan skema, sinkronkan dengan `npx prisma db push` lalu pastikan `npx prisma generate` sukses. Bila hendak beralih ke alur migrasi penuh, buat migrasi lewat `npx prisma migrate dev --name <deskripsi>` dan jangan mengedit migrasi lama yang sudah diterapkan.

Tidak ada `prisma/seed.ts`. Seeding dan utilitas data dilakukan lewat folder `scripts/` yang dijalankan manual dengan `npx tsx`, misalnya `create-super-admin.ts`, `seed-sus.ts`, `seed-notifications.ts`, dan `seed-certificates.ts`.

## Autentikasi dan Peran

Tiga peran pada enum `Role`, yaitu SUPER_ADMIN, ADMIN, dan ANGGOTA. Konfigurasi terbagi dua berkas. `src/auth.config.ts` bersifat edge-safe (tanpa Prisma) dan dipakai oleh `src/proxy.ts` untuk proteksi rute. `src/auth.ts` berisi konfigurasi lengkap dengan PrismaAdapter, provider Credentials, verifikasi bcrypt, dan callback yang menyisipkan `id` serta `role` ke JWT dan session.

Strategi sesi memakai JWT, bukan sesi database. PrismaAdapter tetap terpasang dan tabel Session serta VerificationToken ada di schema, tetapi keduanya praktis tidak dipakai untuk menyimpan sesi.

Proteksi rute berlapis. `proxy.ts` (pengganti middleware di Next.js 16) memeriksa peran lewat matcher, dan layout tiap area (`(admin)/layout.tsx`, `member/layout.tsx`) memanggil helper di `src/lib/auth-helpers.ts` (`requireAdmin`, `requireMemberAuth`, `requireSuperAdmin`). Rute `(admin)` hanya untuk ADMIN dan SUPER_ADMIN. Rute `member` untuk ANGGOTA, dan admin juga boleh masuk. Fitur kelola admin dan reset password hanya untuk SUPER_ADMIN.

## Upload Berkas

Upload foto, video, dan thumbnail memakai Supabase Storage lewat `src/lib/supabase.ts`. Simpan URL publik di database, bukan berkas biner. Bersihkan berkas yatim dengan `scripts/cleanup-orphaned-files.ts`.

## Variabel Lingkungan

Salin `.env.example` menjadi `.env`. Kunci utama: DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET, AUTH_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME. Jangan pernah commit `.env` atau menampilkan nilai rahasia di respons.

## Yang Harus Dilakukan

- Baca kode terkait sebelum mengubahnya dan ikuti pola yang sudah ada.
- Tulis atau perbarui test saat menambah fitur atau memperbaiki bug.
- Jaga perubahan tetap fokus pada permintaan, tanpa refactor yang tidak diminta.
- Jelaskan alasan keputusan teknis secara singkat karena ini proyek skripsi.

## Yang Harus Dihindari

- Jangan menambah dependency baru tanpa alasan kuat, cek dulu yang sudah ada di `package.json`.
- Jangan menaruh logika bisnis di dalam komponen UI, pisahkan ke `lib` atau route handler.
- Jangan menghapus data produksi atau menjalankan migrasi destruktif tanpa konfirmasi.
- Jangan mengganti bahasa domain dari Indonesia ke Inggris.

## Catatan Bahasa

Antarmuka dan istilah domain memakai Bahasa Indonesia. Komentar kode boleh Indonesia atau Inggris asal konsisten dalam satu berkas. Pesan commit mengikuti pola Conventional Commits yang sudah dipakai (feat, fix, chore, refactor, docs).

