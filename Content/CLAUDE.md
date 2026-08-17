# CLAUDE.md

Panduan untuk Claude Code (dan agen AI lain) saat bekerja di repositori ini. Ikuti dokumen ini sebelum menulis atau mengubah kode.

## Ringkasan Proyek

Sistem Informasi Karang Taruna Generasi Emas. Aplikasi web full-stack untuk mengelola keanggotaan, kegiatan, keuangan, dan konten organisasi kepemudaan. Ini adalah proyek skripsi, jadi kestabilan, kejelasan kode, dan kemudahan penjelasan lebih penting daripada trik canggih.

Baca `PRD.md` untuk kebutuhan produk, `desain.md` untuk sistem desain, `AGENTS.md` untuk cara kerja agen, dan `skill.md` untuk metodologi kerja.

## Tech Stack

- Next.js 16 (App Router) dan React 19
- TypeScript mode strict
- Prisma 7 dengan PostgreSQL (adapter `@prisma/adapter-pg`)
- NextAuth v5 (beta) dengan adapter Prisma
- Tailwind CSS v4 dan komponen Radix UI (pola shadcn/ui)
- Zustand (state global), Zod (validasi), React Hook Form
- Supabase Storage (upload berkas), Resend (email)
- Recharts (grafik), TipTap (rich text), jspdf (PDF), xlsx (ekspor Excel)
- Vitest (unit) dan Playwright (e2e)

## Perintah Penting

```bash
npm run dev            # jalankan server pengembangan
npm run build          # build produksi (memakai webpack)
npm run start          # jalankan hasil build
npm run lint           # ESLint
npm run test           # Vitest sekali jalan
npm run test:watch     # Vitest mode watch
npm run test:coverage  # Vitest dengan coverage
npx prisma generate    # generate Prisma Client (juga jalan saat postinstall)
npx prisma migrate dev # buat dan terapkan migrasi di lokal
npx prisma studio      # GUI database
```

Selalu jalankan `npm run lint` dan `npm run test` sebelum menyatakan pekerjaan selesai. Untuk perubahan yang menyentuh tipe atau rute, jalankan juga `npm run build`.

## Struktur Folder

```
src/
  app/
    (public)/      halaman publik: berita, artikel, galeri, kegiatan, program, aspirasi, sus, tentang
    (auth)/        halaman login admin dan anggota
    (admin)/       dashboard admin (dilindungi peran ADMIN/SUPER_ADMIN)
    member/        portal anggota (dilindungi peran ANGGOTA)
    api/           route handler (REST-style) per modul
    verify/        verifikasi sertifikat publik
  components/
    admin/  member/  public/  shared/  ui/
  lib/             helper: prisma, auth, audit, sanitize, validations, supabase, email, logger
  store/           store Zustand
  types/           tipe TypeScript dan augmentasi next-auth
  contexts/        provider React (tema)
prisma/            schema.prisma dan migrasi
scripts/           skrip seed dan utilitas (tsx)
tests/             unit (vitest) dan e2e (playwright)
```

## Konvensi Arsitektur

Route group memakai kurung, yaitu `(public)`, `(auth)`, dan `(admin)`. Kurung tidak menambah segmen URL, hanya mengelompokkan layout.

Default memakai Server Component. Tambahkan `"use client"` hanya bila komponen butuh state, efek, atau event handler browser. Komponen interaktif diberi akhiran atau lokasi yang jelas, misalnya tombol hapus ada di `components/admin/Delete*Button.tsx`.

Route handler ada di `src/app/api/<modul>/route.ts`. Gunakan helper di `src/lib/api-helpers.ts` untuk respons yang konsisten dan `src/lib/auth-helpers.ts` untuk cek sesi dan peran. Jangan mengulang logika autentikasi manual di tiap route.

Setiap aksi tulis yang penting (create, update, delete) harus mencatat audit lewat `src/lib/audit.ts`.

## Konvensi Kode

- Bahasa domain memakai istilah Indonesia (anggota, kegiatan, keuangan, iuran, aspirasi). Pertahankan penamaan ini agar konsisten dengan skema database dan URL.
- Validasi semua input dengan skema Zod yang sudah ada di `src/lib/validations.ts`. Tambah skema baru di sana, jangan buat validasi ad hoc di dalam komponen.
- Sanitasi konten HTML dari editor rich text memakai `src/lib/sanitize.ts` sebelum disimpan atau ditampilkan.
- Impor Prisma Client dari `src/lib/prisma.ts` (singleton), jangan membuat instance baru.
- Utilitas kelas Tailwind memakai `cn()` dari `src/lib/utils.ts`.
- Ikuti token warna dan komponen di `desain.md`. Jangan menaruh warna hex acak di komponen, pakai variabel tema.

## Database

Skema tunggal ada di `prisma/schema.prisma` dengan PostgreSQL. Model penting: User, Anggota, Admin, Kegiatan, AnggotaKegiatan, Sertifikat, Program, Berita, Artikel, GaleriItem, TransaksiKeuangan, IuranAnggota, Aspirasi, Polling, Vote, Notification, SusResponse, AuditLog.

Alur ubah skema: edit `schema.prisma`, jalankan `npx prisma migrate dev --name <deskripsi>`, lalu pastikan `npx prisma generate` sukses. Jangan mengedit berkas migrasi lama yang sudah diterapkan.

## Autentikasi dan Peran

Tiga peran pada enum `Role`, yaitu SUPER_ADMIN, ADMIN, dan ANGGOTA. Konfigurasi ada di `src/auth.ts` dan `src/auth.config.ts`. Rute `(admin)` hanya untuk ADMIN dan SUPER_ADMIN. Rute `member` untuk ANGGOTA, dan admin juga boleh masuk (lihat riwayat perbaikan redirect loop). Fitur kelola admin dan reset password hanya untuk SUPER_ADMIN.

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

