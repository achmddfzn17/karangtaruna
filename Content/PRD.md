# PRD: Sistem Informasi Karang Taruna Muda Berkarya

Product Requirements Document
Versi 1.0 | Terakhir diperbarui 17 Agustus 2026
Status: Aktif (skripsi / tugas akhir)

---

## 1. Ringkasan Produk

Sistem Informasi Karang Taruna Muda Berkarya adalah aplikasi web berbasis Next.js yang membantu organisasi kepemudaan (Karang Taruna) mengelola keanggotaan, kegiatan, keuangan, konten publik, dan partisipasi anggota dalam satu platform terpadu. Aplikasi ini menggantikan pencatatan manual yang tersebar di buku, grup chat, dan berkas kertas menjadi satu sumber data digital yang rapi dan bisa diakses sesuai peran pengguna.

Produk terdiri dari tiga area utama, yaitu situs publik (etalase organisasi untuk masyarakat umum), portal anggota (ruang pribadi anggota terdaftar), dan dashboard admin (pusat kendali pengurus).

## 2. Latar Belakang dan Masalah

Karang Taruna sebagai organisasi kepemudaan di tingkat desa atau kelurahan sering menghadapi kendala administrasi. Data anggota tercatat manual sehingga sulit diperbarui, kehadiran kegiatan didata dengan absensi kertas, laporan keuangan iuran rawan selisih, dan informasi program tidak sampai ke masyarakat luas. Ketiadaan sistem terpusat membuat transparansi rendah dan proses pelaporan lambat.

Aplikasi ini dibangun untuk menjawab masalah tersebut dengan digitalisasi menyeluruh, sekaligus menjadi objek penelitian tugas akhir yang diukur tingkat kegunaannya memakai metode System Usability Scale (SUS).

## 3. Tujuan dan Sasaran

Tujuan utama produk ini adalah:

- Menyediakan basis data anggota yang terpusat, akurat, dan mudah diperbarui.
- Mempermudah pengelolaan kegiatan, absensi, dan penerbitan sertifikat digital.
- Meningkatkan transparansi keuangan melalui pencatatan iuran dan transaksi kas.
- Membuka kanal komunikasi dua arah lewat aspirasi dan e-voting.
- Menyebarkan informasi program dan berita organisasi ke masyarakat luas.

Sasaran terukur:

- Skor SUS aplikasi mencapai kategori minimal "Good" (di atas 68).
- Seluruh modul inti (anggota, kegiatan, keuangan, konten) berfungsi tanpa kesalahan kritis.
- Waktu muat halaman utama di bawah tiga detik pada koneksi normal.

## 4. Ruang Lingkup

Termasuk dalam ruang lingkup: manajemen anggota, kegiatan dan absensi, sertifikat, keuangan dan iuran, konten (berita, artikel, galeri, program), aspirasi, e-voting, notifikasi, audit log, dan survei SUS.

Di luar ruang lingkup versi ini: pembayaran iuran otomatis lewat payment gateway, aplikasi mobile native, dan integrasi dengan sistem pemerintahan desa. Hal-hal tersebut menjadi kandidat pengembangan lanjutan.

## 5. Persona dan Peran Pengguna

Sistem memakai tiga peran yang tersimpan pada enum `Role` (SUPER_ADMIN, ADMIN, ANGGOTA) ditambah pengunjung publik tanpa akun.

| Peran | Deskripsi | Akses utama |
| --- | --- | --- |
| Super Admin | Ketua atau pengelola tertinggi | Semua fitur, termasuk kelola admin dan reset password |
| Admin | Pengurus harian | Kelola anggota, kegiatan, keuangan, konten, notifikasi |
| Anggota | Pemuda terdaftar | Lihat kegiatan, bayar iuran, ambil sertifikat, voting, aspirasi |
| Publik | Masyarakat umum | Baca berita, artikel, galeri, program, kirim aspirasi, isi SUS |

## 6. Kebutuhan Fungsional

Kebutuhan fungsional dikelompokkan per modul. Setiap modul sudah tercermin pada struktur folder `src/app` dan skema Prisma.

### 6.1 Autentikasi dan Otorisasi
- Login admin melalui `/login` dan login anggota melalui `/anggota/login`.
- Sesi dikelola NextAuth v5 dengan provider Credentials. Strategi sesi memakai JWT, sedangkan PrismaAdapter tetap terpasang.
- Kata sandi di-hash memakai bcryptjs.
- Proteksi rute berlapis. Berkas `proxy.ts` (pengganti middleware di Next.js 16) bersama `auth.config.ts` yang edge-safe menjaga rute admin dan member, ditambah pengecekan peran pada layout tiap area.

### 6.2 Manajemen Anggota
- Tambah, ubah, hapus, dan lihat data anggota (nama, NIK 16 digit, kontak, alamat, status).
- Status anggota AKTIF, NON_AKTIF, atau ALUMNI.
- Ekspor data anggota ke Excel.
- Kartu anggota digital yang bisa dilihat anggota di portalnya.

### 6.3 Kegiatan dan Absensi
- Buat kegiatan dengan jenis (sosial, pendidikan, ekonomi, olahraga, seni budaya, lainnya) dan status (upcoming, ongoing, selesai, dibatalkan).
- Anggota mendaftar kegiatan lewat portal.
- Admin menandai kehadiran (absensi) per peserta.
- Ekspor rekap absensi ke Excel.

### 6.4 Sertifikat Digital
- Terbitkan sertifikat otomatis untuk peserta yang hadir.
- Nomor sertifikat unik, QR code, dan berkas PDF (jspdf).
- Verifikasi publik lewat `/verify/[nomorSertifikat]`.

### 6.5 Keuangan dan Iuran
- Catat transaksi kas masuk dan keluar beserta kategori dan bukti.
- Kelola iuran anggota per bulan dan tahun (unik per anggota per periode).
- Grafik laporan keuangan (recharts) dan ekspor Excel.

### 6.6 Konten Publik
- Berita dan artikel dengan editor rich text (TipTap), slug unik, tag, kategori, status draft/published/archived, dan hitung view.
- Galeri foto dan video, bisa terhubung ke kegiatan.
- Program kerja dengan urutan tampil dan ikon.

### 6.7 Aspirasi
- Pengunjung atau anggota mengirim aspirasi (judul, pesan, kategori).
- Admin mengubah status (pending, diproses, selesai, ditolak) dan memberi balasan.

### 6.8 E-Voting (Polling)
- Admin membuat polling dengan beberapa opsi dan batas waktu.
- Anggota memberi satu suara per polling (unik per user per polling).

### 6.9 Notifikasi
- Notifikasi ke seluruh anggota (global) atau target pengguna tertentu.
- Penanda sudah dibaca per pengguna lewat model NotificationRead.
- Ada lonceng notifikasi pada header member dan admin.

### 6.10 Audit Log
- Catat aksi penting (create, update, delete, login) beserta modul, target, dan alamat IP.
- Rekap audit dapat dilihat pengurus lewat halaman `/dashboard/log`.

### 6.11 Survei SUS
- Kuesioner 10 pertanyaan standar SUS, skor dihitung otomatis dan dikategorikan.
- Dashboard analitik SUS (histogram dan rata-rata) untuk kebutuhan pengujian skripsi.

### 6.12 Kalender dan Manajemen Admin
- Kalender kegiatan yang bisa diakses admin dan anggota lewat endpoint `/api/calendar/events`.
- Kelola akun admin dan reset password oleh SUPER_ADMIN.
- Laporan keuangan terpisah dengan grafik dan ekspor.

## 7. Kebutuhan Non-Fungsional

- Keamanan: validasi input dengan Zod, sanitasi HTML (isomorphic-dompurify) pada konten rich text, proteksi rute berbasis peran, dan hashing kata sandi.
- Kinerja: Server Components dan caching Next.js, indeks database pada kolom yang sering difilter.
- Ketersediaan: siap deploy di Vercel dengan PostgreSQL (Supabase atau penyedia lain) dan connection pooler.
- Aksesibilitas: komponen berbasis Radix UI yang mendukung keyboard dan screen reader.
- Responsif: tampilan optimal di ponsel, tablet, dan desktop.
- Dukungan mode gelap lewat next-themes.

## 8. Alur Pengguna Utama

Alur anggota baru: admin membuat akun anggota, anggota login, melengkapi profil, mendaftar kegiatan, hadir, lalu mengunduh sertifikat.

Alur transparansi keuangan: admin mencatat iuran dan transaksi, sistem menghasilkan grafik, anggota memantau ringkasan kas di portal.

Alur partisipasi: admin membuka polling atau menerima aspirasi, anggota dan publik berpartisipasi, admin menindaklanjuti.

## 9. Metrik Keberhasilan

- Skor rata-rata SUS di atas 68 (kategori Good ke atas).
- Tingkat penyelesaian tugas inti di atas 90 persen saat uji coba pengguna.
- Nol kesalahan kritis pada modul anggota, kegiatan, dan keuangan.
- Umpan balik kualitatif positif dari pengurus dan anggota.

## 10. Batasan dan Asumsi

- Data awal dimasukkan oleh pengurus, bukan migrasi otomatis dari sistem lama.
- Koneksi internet tersedia saat mengakses aplikasi.
- Penyimpanan berkas memakai Supabase Storage.
- Aplikasi berbahasa Indonesia karena target pengguna lokal.

## 11. Rencana Pengembangan Lanjutan

- Integrasi payment gateway untuk pembayaran iuran daring.
- Pengingat kegiatan otomatis lewat email atau WhatsApp.
- Progressive Web App agar bisa dipasang di ponsel.
- Dashboard analitik yang lebih kaya untuk pengurus.

## 12. Lampiran Teknologi

Framework Next.js 16.2.4 (App Router) dan React 19.2.4, bahasa TypeScript mode strict, basis data PostgreSQL dengan ORM Prisma 7.8.0 memakai driver adapter `@prisma/adapter-pg` di atas `pg` Pool, autentikasi NextAuth v5 dengan strategi sesi JWT, penyimpanan berkas Supabase Storage, styling Tailwind CSS v4 dengan komponen Radix UI (pola shadcn), state global Zustand, validasi Zod, form React Hook Form, grafik Recharts, editor TipTap, ekspor Excel dengan library xlsx, pembuatan PDF dengan jspdf dan jspdf-autotable, pengiriman email dengan Resend, serta pengujian unit dengan Vitest. Pengujian end to end memakai Playwright masih berupa kerangka skenario dan belum dipasang sebagai dependency.

