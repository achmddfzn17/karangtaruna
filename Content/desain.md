# desain.md

Sistem Desain Karang Taruna Muda Berkarya. Dokumen ini menetapkan fondasi visual aplikasi agar tampilan konsisten di seluruh halaman. Formatnya mengadaptasi konsep design system ala `nexu-io/open-design`, disesuaikan dengan token nyata pada `src/app/globals.css`.

## Prinsip Desain

Desain mengutamakan kejelasan, keterbacaan, dan rasa terpercaya. Aplikasi ini dipakai pengurus dan anggota lintas usia, jadi antarmuka harus sederhana, kontras cukup, dan konsisten. Nuansa biru dipilih untuk memberi kesan resmi, muda, dan tenang.

## Token Warna

Warna didefinisikan sebagai variabel CSS di `globals.css` dan diekspos ke Tailwind v4 lewat blok `@theme inline`. Selalu pakai variabel tema, jangan hex acak di komponen.

### Mode Terang (light)

| Token | Nilai | Kegunaan |
| --- | --- | --- |
| background | #f8fafc | Latar halaman |
| foreground | #0f172a | Teks utama |
| card | #ffffff | Latar kartu |
| primary | #2563eb | Aksi utama, tautan, tombol |
| secondary | #f1f5f9 | Elemen sekunder |
| muted-foreground | #64748b | Teks redup |
| accent | #eff6ff | Sorotan lembut |
| destructive | #ef4444 | Aksi hapus atau bahaya |
| success | #22c55e | Status berhasil |
| warning | #f59e0b | Peringatan |
| border | #e2e8f0 | Garis batas |
| ring | #2563eb | Cincin fokus |

### Mode Gelap (dark)

| Token | Nilai | Kegunaan |
| --- | --- | --- |
| background | #0f172a | Latar halaman |
| foreground | #f8fafc | Teks utama |
| card | #1e293b | Latar kartu |
| primary | #3b82f6 | Aksi utama |
| muted-foreground | #94a3b8 | Teks redup |
| accent | #1e3a8a | Sorotan |
| destructive | #dc2626 | Aksi hapus |
| border | #334155 | Garis batas |

### Sidebar dan Brand
Sidebar admin memakai nuansa gelap (`--sidebar` #1e293b pada mode terang, #0f172a pada mode gelap) agar navigasi menonjol. Gradien brand memakai `--gradient-from` dan `--gradient-to` (biru tua ke biru terang) untuk hero dan header.

Radius sudut default `--radius` bernilai 0.5rem.

## Mode Gelap

Mode gelap dikelola `next-themes` dengan strategi berbasis kelas (`.dark`). Toggle ada pada komponen `components/ui/dark-mode-toggle.tsx`. Setiap komponen harus tampil baik di kedua mode karena semua warna memakai variabel yang otomatis berganti.

## Tipografi

Font memakai Geist dan Geist Mono lewat `next/font/google`, dipetakan ke variabel `--font-sans` dan `--font-mono` pada `layout.tsx`. Skala tipografi mengikuti utilitas Tailwind, yaitu judul besar `text-3xl` sampai `text-4xl` dengan `font-bold`, judul bagian `text-xl` sampai `text-2xl` dengan `font-semibold`, teks isi `text-sm` sampai `text-base`, dan teks bantu `text-xs` dengan warna `muted-foreground`. Jaga tinggi baris nyaman dibaca (`leading-relaxed`) pada paragraf panjang.

## Spasi dan Tata Letak

Gunakan skala spasi Tailwind (kelipatan 4px). Jarak antar bagian umumnya `gap-4` sampai `gap-6`, padding kartu `p-4` sampai `p-6`, dan lebar konten maksimum memakai `container` atau `max-w-7xl mx-auto`. Grid dashboard memakai `grid` responsif, misalnya `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` untuk kartu statistik.

## Inventaris Komponen

Komponen dasar ada di `src/components/ui` mengikuti pola shadcn/ui di atas Radix UI. Berkas yang benar-benar ada, yaitu avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, progress, scroll-area, select, separator, switch, tabs, textarea, skeleton, dan dark-mode-toggle. Notifikasi toast tidak memakai komponen `ui` sendiri, melainkan library `sonner`.

Komponen bersama di `src/components/shared`, yaitu DataTable (memakai `@tanstack/react-table`), FormModal, ConfirmModal, PageHeader, StatCard, StatusBadge, dan RichTextEditor (memakai TipTap). Komponen khusus area ada di `admin` (sekitar 33 berkas, termasuk banyak tombol Delete, Export, dan grafik dashboard), `member` (sekitar 14 berkas untuk layout dan fitur anggota), dan `public` (10 berkas section landing page seperti HeroSection, ProgramSection, dan Footer).

Aturan pakai: jangan membuat komponen baru bila sudah ada yang setara. Perluas komponen di `ui` atau `shared` agar konsisten.

## Pola Layout

Situs publik memakai Navbar di atas, konten bagian per bagian (hero, program, kegiatan, berita, galeri, tentang), dan Footer. Portal anggota dan dashboard admin memakai layout sidebar kiri (MemberSidebar dan AdminSidebar) plus header atas dengan lonceng notifikasi. Sidebar bisa diciutkan pada layar kecil.

## Ikon dan Ilustrasi

Ikon memakai `lucide-react`. Pakai ukuran konsisten (umumnya 16px sampai 20px dalam teks, 24px untuk aksi utama). Logo tersedia di `public/logo.png` dan `public/hero-logo.png`.

## Motion

Animasi memakai `framer-motion` dan `tailwindcss-animate`. Gunakan transisi halus dan singkat (150ms sampai 300ms) untuk hover, munculnya modal, dan pergantian tab. Hindari animasi berlebihan yang mengganggu keterbacaan.

## Aksesibilitas

Komponen Radix sudah mendukung navigasi keyboard dan atribut ARIA. Pastikan kontras teks memenuhi standar WCAG AA, setiap input punya label, gambar punya teks alternatif, dan fokus terlihat lewat token `ring`. Uji alur penting memakai keyboard saja.

## Responsif

Desain mobile-first. Uji pada tiga titik henti utama, yaitu ponsel (di bawah 768px), tablet (768px sampai 1024px), dan desktop (di atas 1024px). Tabel data pada layar kecil sebaiknya bisa digulir horizontal atau berubah menjadi kartu.

## Grafik dan Data

Visualisasi keuangan dan statistik memakai `recharts`. Samakan warna grafik dengan token brand (primary, success, warning, destructive) agar seragam dengan sisa antarmuka.

