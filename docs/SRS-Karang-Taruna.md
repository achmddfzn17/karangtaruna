# Software Requirement Specification (SRS)

# Sistem Informasi Manajemen Karang Taruna

> Dokumen Pengembangan Sistem berbasis metodologi **PPDIO**
> (Prepare – Plan – Design – Implement – Operate – Optimize)

| Field | Detail |
|---|---|
| **Nama Sistem** | Sistem Informasi Manajemen Karang Taruna |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 22 Mei 2026 |
| **Stack Teknologi** | Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL, NextAuth v5, Tailwind CSS 4, Supabase Storage |
| **Metodologi** | PPDIO + Agile Iterative |

---

## Daftar Isi

1. [Planning](#1-planning)
2. [Preparation](#2-preparation)
3. [Design (UML Diagrams)](#3-design-uml-diagrams)
4. [Implementation](#4-implementation)
5. [Operation](#5-operation)

---

## 1. Planning

### 1.1 Latar Belakang

Karang Taruna adalah organisasi kepemudaan tingkat desa/kelurahan di Indonesia yang
berperan dalam pemberdayaan generasi muda di bidang sosial, ekonomi, pendidikan, dan
budaya. Pada praktiknya, sebagian besar Karang Taruna masih mengelola data anggota,
kegiatan, keuangan, dan dokumentasi secara **manual** (buku, spreadsheet, atau pesan
WhatsApp). Hal ini menyebabkan:

- Data anggota tidak terpusat dan rentan hilang.
- Sulit melakukan absensi & rekap kegiatan.
- Laporan keuangan tidak transparan.
- Komunikasi aspirasi anggota tidak terdokumentasi.
- Tidak ada arsip digital untuk berita, artikel, dan galeri kegiatan.

### 1.2 Kebutuhan Bisnis

| No | Kode | Kebutuhan Bisnis |
|---|---|---|
| 1 | KB-01 | Sentralisasi data master anggota Karang Taruna (profil, NIK, status keanggotaan). |
| 2 | KB-02 | Digitalisasi pencatatan kegiatan beserta absensi peserta. |
| 3 | KB-03 | Penerbitan sertifikat digital ber-QR Code untuk setiap kegiatan. |
| 4 | KB-04 | Transparansi keuangan organisasi (kas masuk/keluar) dan iuran bulanan anggota. |
| 5 | KB-05 | Publikasi konten (berita, artikel, galeri, program) ke masyarakat luas. |
| 6 | KB-06 | Wadah aspirasi anggota & masyarakat yang terdokumentasi dan dapat ditindaklanjuti. |
| 7 | KB-07 | Pengambilan keputusan organisasi melalui e-voting (polling) yang adil. |
| 8 | KB-08 | Evaluasi kepuasan pengguna sistem berbasis kuesioner SUS (System Usability Scale). |
| 9 | KB-09 | Audit trail seluruh aktivitas administratif untuk akuntabilitas. |

### 1.3 Tujuan Sistem

**Tujuan Umum:**
Membangun platform berbasis web yang modern, terpusat, dan mudah digunakan untuk
mengelola seluruh aktivitas administratif Karang Taruna sekaligus menjadi sarana
publikasi dan komunikasi dua arah dengan masyarakat.

**Tujuan Khusus (SMART):**

| Kode | Tujuan | Indikator Keberhasilan |
|---|---|---|
| TJ-01 | Menyediakan modul CRUD anggota dengan validasi NIK unik. | 100% data anggota tersimpan tanpa duplikasi. |
| TJ-02 | Menyediakan modul kegiatan, absensi, dan sertifikat otomatis. | Sertifikat ber-QR terbit < 5 detik setelah absensi ditandai hadir. |
| TJ-03 | Menyediakan dashboard keuangan dengan grafik tren bulanan. | Laporan kas dapat diunduh dalam format Excel/PDF. |
| TJ-04 | Memberikan akses publik untuk berita, artikel, galeri, & program. | Halaman publik di-index Google & memiliki Lighthouse score ≥ 85. |
| TJ-05 | Memfasilitasi e-voting satu suara per anggota per polling. | Constraint `@@unique([userId, pollingId])` mencegah double-vote. |
| TJ-06 | Mengukur usability sistem ≥ 70 (kategori "Good") via SUS. | Skor SUS rata-rata ≥ 70 setelah 3 bulan operasi. |
| TJ-07 | Mencatat seluruh perubahan data dalam audit log. | 100% aksi CREATE/UPDATE/DELETE tercatat di tabel `audit_logs`. |

### 1.4 Manfaat Sistem

**Bagi Pengurus / Admin:**
- Efisiensi waktu administrasi (estimasi −60% dibanding manual).
- Laporan otomatis (kegiatan, keuangan, kehadiran) siap pakai.
- Notifikasi terpusat untuk koordinasi.

**Bagi Anggota:**
- Akses profil pribadi, riwayat kegiatan, dan sertifikat kapan saja.
- Pembayaran iuran tercatat transparan.
- Saluran aspirasi & e-voting yang akuntabel.

**Bagi Masyarakat (Publik):**
- Informasi kegiatan, berita, dan program desa selalu up-to-date.
- Dapat menyampaikan aspirasi langsung.

**Bagi Organisasi:**
- Brand awareness meningkat melalui kanal digital.
- Keputusan berbasis data (data-driven) dari analitik dashboard.
- Memenuhi prinsip *good governance* (transparansi & akuntabilitas).

### 1.5 Ruang Lingkup Sistem (Scope)

**In-Scope:**
- Web application (responsive, mobile-first).
- 4 peran pengguna: Super Admin, Admin, Anggota, Publik.
- Modul: Auth, Anggota, Kegiatan, Sertifikat, Konten (Berita/Artikel/Galeri/Program),
  Keuangan, Iuran, Aspirasi, Polling, Notifikasi, SUS, Audit Log, Kalender.

**Out-of-Scope (versi 1.0):**
- Aplikasi mobile native (Android/iOS).
- Integrasi payment gateway untuk iuran.
- Live streaming kegiatan.
- Modul HRIS / penggajian pengurus.



---

## 2. Preparation

### 2.1 Aktor Sistem

| Aktor | Deskripsi | Hak Akses |
|---|---|---|
| **Super Admin** | Pemilik organisasi / ketua. | Full access seluruh modul + manajemen admin. |
| **Admin** | Pengurus harian (sekretaris, bendahara). | CRUD modul operasional kecuali manajemen admin. |
| **Anggota** | Pemuda terdaftar di Karang Taruna. | Lihat profil, kegiatan, sertifikat, iuran, voting, aspirasi. |
| **Publik** | Pengunjung umum (tanpa login). | Lihat berita, artikel, galeri, program, kegiatan publik, isi SUS, kirim aspirasi. |

### 2.2 Kebutuhan Fungsional (Functional Requirements)

| Kode | Modul | Kebutuhan | Aktor |
|---|---|---|---|
| **FR-01** | Auth | Sistem dapat melakukan registrasi & login dengan email + password (NextAuth + bcrypt). | Semua |
| **FR-02** | Auth | Sistem dapat membatasi akses berdasarkan role (RBAC). | Semua |
| **FR-03** | Anggota | Admin dapat menambah, mengubah, menghapus, dan menampilkan data anggota. | Admin |
| **FR-04** | Anggota | Sistem memvalidasi NIK unik (16 digit) dan email unik. | Admin |
| **FR-05** | Anggota | Admin dapat membuatkan akun login untuk anggota. | Admin |
| **FR-06** | Kegiatan | Admin dapat membuat, mengubah, menghapus kegiatan dengan status (UPCOMING/ONGOING/SELESAI/DIBATALKAN). | Admin |
| **FR-07** | Kegiatan | Admin dapat menandai kehadiran (absensi) peserta kegiatan. | Admin |
| **FR-08** | Sertifikat | Sistem otomatis menerbitkan sertifikat ber-QR Code untuk peserta yang hadir. | Sistem |
| **FR-09** | Sertifikat | Publik dapat memverifikasi sertifikat melalui halaman `/verify/[nomor]`. | Publik |
| **FR-10** | Konten | Admin dapat membuat berita & artikel dengan TipTap rich-editor (DRAFT/PUBLISHED/ARCHIVED). | Admin |
| **FR-11** | Galeri | Admin dapat mengunggah foto & video dan menautkannya ke kegiatan. | Admin |
| **FR-12** | Program | Admin dapat mengelola program kerja (CRUD + urutan tampil). | Admin |
| **FR-13** | Keuangan | Admin dapat mencatat transaksi MASUK/KELUAR dengan kategori dan bukti. | Admin |
| **FR-14** | Keuangan | Sistem menyajikan ringkasan saldo, grafik tren, dan ekspor Excel/PDF. | Admin |
| **FR-15** | Iuran | Admin dapat mencatat pembayaran iuran per anggota per bulan/tahun (unik). | Admin |
| **FR-16** | Aspirasi | Pengguna (anggota/publik) dapat mengirim aspirasi; admin dapat membalas & mengubah status. | Semua |
| **FR-17** | Polling | Admin dapat membuat polling dengan beberapa opsi & batas waktu. | Admin |
| **FR-18** | Polling | Anggota dapat memberikan satu suara per polling (anti double-vote). | Anggota |
| **FR-19** | Notifikasi | Sistem mengirim notifikasi in-app saat ada kegiatan, balasan aspirasi, atau polling baru. | Sistem |
| **FR-20** | SUS | Pengguna dapat mengisi kuesioner SUS 10 pertanyaan; sistem menghitung skor otomatis. | Semua |
| **FR-21** | Audit | Sistem mencatat aksi CREATE/UPDATE/DELETE/LOGIN ke `audit_logs`. | Sistem |
| **FR-22** | Kalender | Sistem menampilkan kalender kegiatan bulanan. | Anggota/Admin |
| **FR-23** | Dashboard | Admin melihat statistik real-time (jumlah anggota, kegiatan aktif, kas, dll). | Admin |
| **FR-24** | Public | Pengunjung dapat melihat halaman beranda, tentang, berita, artikel, galeri, program, kegiatan. | Publik |

### 2.3 Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kode | Kategori | Kebutuhan | Target / Metrik |
|---|---|---|---|
| **NFR-01** | Performance | Halaman publik dimuat cepat. | LCP ≤ 2.5 s; TTFB ≤ 600 ms. |
| **NFR-02** | Performance | API response time. | P95 ≤ 500 ms untuk operasi baca. |
| **NFR-03** | Scalability | Mendukung minimal 1.000 anggota & 5.000 sesi/bulan. | Horizontal scaling via Vercel/Cloud. |
| **NFR-04** | Security | Password di-hash menggunakan bcrypt (cost ≥ 10). | OWASP ASVS L1. |
| **NFR-05** | Security | Proteksi terhadap XSS pada konten rich-text. | Sanitasi via DOMPurify / isomorphic-dompurify. |
| **NFR-06** | Security | CSRF token & secure cookie pada NextAuth. | `httpOnly`, `secure`, `sameSite=lax`. |
| **NFR-07** | Reliability | Uptime SLA. | ≥ 99,5% / bulan. |
| **NFR-08** | Reliability | Backup database. | Harian (otomatis) + retensi 30 hari. |
| **NFR-09** | Usability | Skor SUS sistem. | ≥ 70 (kategori "Good"). |
| **NFR-10** | Compatibility | Dukung browser modern. | Chrome, Edge, Firefox, Safari (2 versi terakhir). |
| **NFR-11** | Compatibility | Responsive design. | Mobile (≥ 360px), Tablet, Desktop. |
| **NFR-12** | Maintainability | Code coverage. | ≥ 70% untuk lib & utils. |
| **NFR-13** | Maintainability | Kode mengikuti ESLint + TypeScript strict. | 0 error pada CI. |
| **NFR-14** | Auditability | Seluruh aksi data tercatat. | 100% di tabel `audit_logs`. |
| **NFR-15** | Localization | Bahasa antarmuka Indonesia (utama). | Format tanggal `id-ID`. |
| **NFR-16** | Storage | Penyimpanan file (foto, sertifikat, bukti). | Supabase Storage, max 5 MB/file. |

### 2.4 Asumsi

1. Pengguna telah memiliki perangkat dengan akses internet stabil minimal 1 Mbps.
2. Setiap anggota memiliki email aktif untuk login & notifikasi.
3. Data master (nama desa, periode kepengurusan) di-set oleh Super Admin saat onboarding.
4. Server hosting (Vercel/VPS) dan PostgreSQL (Supabase/Neon) selalu tersedia.
5. Pengurus memiliki minimal kemampuan dasar mengoperasikan web browser.
6. NIK anggota valid sesuai KTP (16 digit numerik).

### 2.5 Batasan (Constraints)

| Kode | Batasan |
|---|---|
| **C-01** | Sistem berbasis web; **belum** tersedia aplikasi mobile native pada v1.0. |
| **C-02** | Iuran dicatat secara manual oleh bendahara; **belum** ada integrasi payment gateway. |
| **C-03** | Notifikasi hanya in-app + email (Resend); **belum** push notification atau WhatsApp API. |
| **C-04** | Bahasa antarmuka hanya Bahasa Indonesia. |
| **C-05** | Ukuran upload file maksimum 5 MB (foto) dan 50 MB (video) karena batasan storage. |
| **C-06** | Sertifikat di-generate sebagai PDF dengan template tetap; kustomisasi template di luar scope v1.0. |
| **C-07** | E-voting hanya menggunakan satu suara per anggota per polling (single-choice). |
| **C-08** | Database adalah PostgreSQL (vendor lock-in pada PostgreSQL ≥ 14). |



---

## 3. Design (UML Diagrams)

### 3.1 Use Case Diagram

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart LR
    %% Actors
    Publik((Publik))
    Anggota((Anggota))
    Admin((Admin))
    SuperAdmin((Super Admin))

    %% System boundary
    subgraph SISTEM["Sistem Informasi Karang Taruna"]
        UC1[Lihat Beranda & Konten Publik]
        UC2[Verifikasi Sertifikat]
        UC3[Kirim Aspirasi]
        UC4[Isi Kuesioner SUS]
        UC5[Login / Logout]

        UC10[Lihat Profil & Riwayat Kegiatan]
        UC11[Unduh Sertifikat]
        UC12[Lihat Iuran Pribadi]
        UC13[Ikut E-Voting]
        UC14[Lihat Notifikasi]

        UC20[Kelola Anggota]
        UC21[Kelola Kegiatan]
        UC22[Tandai Absensi]
        UC23[Terbitkan Sertifikat]
        UC24[Kelola Berita & Artikel]
        UC25[Kelola Galeri & Program]
        UC26[Kelola Keuangan & Iuran]
        UC27[Kelola Polling]
        UC28[Balas Aspirasi]
        UC29[Lihat Dashboard & Laporan]

        UC40[Kelola Admin]
        UC41[Lihat Audit Log]
        UC42[Konfigurasi Sistem]
    end

    %% Publik
    Publik --> UC1
    Publik --> UC2
    Publik --> UC3
    Publik --> UC4
    Publik --> UC5

    %% Anggota inherits Publik
    Anggota --> UC5
    Anggota --> UC10
    Anggota --> UC11
    Anggota --> UC12
    Anggota --> UC13
    Anggota --> UC14
    Anggota --> UC3

    %% Admin inherits Anggota
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28
    Admin --> UC29

    %% Super Admin inherits Admin
    SuperAdmin --> UC40
    SuperAdmin --> UC41
    SuperAdmin --> UC42

    %% include / extend relationships
    UC22 -. include .-> UC23
    UC21 -. include .-> UC14
```

#### Deskripsi Setiap Use Case

| ID | Use Case | Aktor | Deskripsi Singkat | Pre-condition | Post-condition |
|---|---|---|---|---|---|
| UC-01 | Lihat Beranda & Konten Publik | Publik | Menampilkan landing page, berita, artikel, galeri, program, kegiatan publik. | – | Konten ter-render. |
| UC-02 | Verifikasi Sertifikat | Publik | Memasukkan nomor sertifikat / scan QR untuk verifikasi keaslian. | Memiliki nomor sertifikat. | Status valid/invalid ditampilkan. |
| UC-03 | Kirim Aspirasi | Publik/Anggota | Mengirim aspirasi/saran/keluhan. | – | Aspirasi tersimpan dengan status PENDING. |
| UC-04 | Isi Kuesioner SUS | Publik/Anggota | Mengisi 10 pertanyaan SUS untuk evaluasi. | – | Skor SUS dihitung dan disimpan. |
| UC-05 | Login / Logout | Semua user terdaftar | Autentikasi via NextAuth (email + password). | Punya akun. | Sesi dibuat / dihapus. |
| UC-10 | Lihat Profil & Riwayat | Anggota | Melihat data diri & daftar kegiatan yang diikuti. | Login sebagai Anggota. | Data ditampilkan. |
| UC-11 | Unduh Sertifikat | Anggota | Mengunduh PDF sertifikat kegiatan yang dihadiri. | Status hadir = TRUE. | PDF terunduh. |
| UC-12 | Lihat Iuran Pribadi | Anggota | Melihat status pembayaran iuran per bulan. | Login. | Riwayat iuran tampil. |
| UC-13 | Ikut E-Voting | Anggota | Memberikan satu suara pada polling aktif. | Polling aktif & belum vote. | Vote tersimpan. |
| UC-14 | Lihat Notifikasi | Anggota/Admin | Membaca notifikasi in-app. | Login. | `isRead = true`. |
| UC-20 | Kelola Anggota | Admin | CRUD data anggota + buat akun login. | Login Admin. | Data anggota ter-update. |
| UC-21 | Kelola Kegiatan | Admin | CRUD kegiatan + status. | Login Admin. | Data kegiatan ter-update. |
| UC-22 | Tandai Absensi | Admin | Menandai peserta hadir/tidak hadir. | Kegiatan = ONGOING/SELESAI. | Field `hadir` ter-update. |
| UC-23 | Terbitkan Sertifikat | Admin/Sistem | Generate sertifikat ber-QR untuk peserta hadir. | `hadir = TRUE`. | Sertifikat tersimpan + PDF tersedia. |
| UC-24 | Kelola Berita & Artikel | Admin | CRUD konten dengan TipTap editor + tags. | Login Admin. | Konten DRAFT/PUBLISHED. |
| UC-25 | Kelola Galeri & Program | Admin | Upload media & atur program kerja. | Login Admin. | Galeri/program ter-update. |
| UC-26 | Kelola Keuangan & Iuran | Admin (Bendahara) | Catat transaksi & iuran anggota. | Login Admin. | Saldo & laporan ter-update. |
| UC-27 | Kelola Polling | Admin | Buat polling, opsi, dan masa berlaku. | Login Admin. | Polling tersimpan & aktif. |
| UC-28 | Balas Aspirasi | Admin | Mengubah status & memberi balasan aspirasi. | Aspirasi PENDING. | Status ↦ DIPROSES/SELESAI/DITOLAK. |
| UC-29 | Lihat Dashboard & Laporan | Admin | Melihat statistik & ekspor laporan. | Login Admin. | Laporan ter-render / terunduh. |
| UC-40 | Kelola Admin | Super Admin | Tambah/hapus admin & atur jabatan. | Login Super Admin. | User table ter-update. |
| UC-41 | Lihat Audit Log | Super Admin | Membaca riwayat aktivitas sistem. | Login Super Admin. | Audit log tampil. |
| UC-42 | Konfigurasi Sistem | Super Admin | Atur konfigurasi global (logo, dll). | Login Super Admin. | Config ter-update. |

---

### 3.2 Class Diagram

```mermaid
classDiagram
    direction LR

    class User {
        +String id
        +String name
        +String email
        +String password
        +Role role
        +DateTime createdAt
        +login(email, pwd) Session
        +logout() void
        +hasPermission(perm) boolean
    }

    class Anggota {
        +String id
        +String namaLengkap
        +String nik
        +DateTime tanggalLahir
        +JenisKelamin jenisKelamin
        +String alamat
        +String noHp
        +StatusAnggota status
        +DateTime tanggalGabung
        +daftar() void
        +updateProfil() void
    }

    class Admin {
        +String id
        +String nip
        +String jabatan
        +String phone
    }

    class Kegiatan {
        +String id
        +String nama
        +String deskripsi
        +JenisKegiatan jenis
        +DateTime tanggalMulai
        +DateTime tanggalSelesai
        +String lokasi
        +Float anggaran
        +StatusKegiatan status
        +tambahPeserta(anggota) void
        +tandaiHadir(anggotaId) void
        +ubahStatus(status) void
    }

    class AnggotaKegiatan {
        +String id
        +String anggotaId
        +String kegiatanId
        +Boolean hadir
        +tandaiHadir() void
    }

    class Sertifikat {
        +String id
        +String nomorSertifikat
        +String namaAnggota
        +String namaKegiatan
        +DateTime tanggalTerbit
        +String qrCode
        +String pdfUrl
        +generate() Sertifikat
        +verifikasi(nomor) boolean
    }

    class Berita {
        +String id
        +String judul
        +String slug
        +String isi
        +StatusPublish status
        +DateTime publishedAt
        +Int viewCount
        +publish() void
        +arsipkan() void
    }

    class Artikel {
        +String id
        +String judul
        +String slug
        +String isi
        +StatusPublish status
    }

    class GaleriItem {
        +String id
        +String judul
        +String url
        +GaleriType type
        +String kegiatanId
    }

    class Program {
        +String id
        +String nama
        +String deskripsi
        +Boolean status
        +Int urutan
    }

    class TransaksiKeuangan {
        +String id
        +DateTime tanggal
        +String keterangan
        +Float jumlah
        +JenisTransaksi jenis
        +String kategoriId
        +String bukti
        +catat() void
    }

    class IuranAnggota {
        +String id
        +String anggotaId
        +Int bulan
        +Int tahun
        +Float jumlah
        +DateTime tanggalBayar
    }

    class Aspirasi {
        +String id
        +String judul
        +String pesan
        +String kategori
        +StatusAspirasi status
        +String balasan
        +balas(pesan) void
    }

    class Polling {
        +String id
        +String judul
        +Boolean isActive
        +DateTime expiresAt
        +tambahOpsi(label) void
        +tutup() void
    }

    class PollingOption {
        +String id
        +String label
    }

    class Vote {
        +String id
        +String userId
        +String pollingId
        +String optionId
        +simpan() void
    }

    class Notification {
        +String id
        +String title
        +String message
        +String type
        +Boolean isRead
        +tandaiDibaca() void
    }

    class SusResponse {
        +String id
        +Int q1..q10
        +Float score
        +String kategori
        +hitungSkor() Float
    }

    class AuditLog {
        +String id
        +String userId
        +String action
        +String module
        +String detail
        +DateTime createdAt
        +catat(action, module) void
    }

    %% Relationships
    User "1" -- "0..1" Anggota : akun
    User "1" -- "0..1" Admin : akun
    User "1" -- "*" Notification
    User "1" -- "*" Vote
    User "1" -- "*" Aspirasi : mengirim

    Anggota "1" -- "*" AnggotaKegiatan
    Kegiatan "1" -- "*" AnggotaKegiatan
    AnggotaKegiatan "1" -- "0..1" Sertifikat : menghasilkan

    Kegiatan "1" -- "*" GaleriItem
    Polling "1" -- "*" PollingOption
    PollingOption "1" -- "*" Vote
    Anggota "1" -- "*" IuranAnggota
    TransaksiKeuangan "*" -- "0..1" KategoriTransaksi
```

---

### 3.3 Sequence Diagram — Fitur Utama: **Penerbitan Sertifikat Otomatis**

Skenario: Admin menandai peserta hadir pada sebuah kegiatan, sistem otomatis membuat
sertifikat ber-QR Code, menyimpan PDF, dan mengirim notifikasi ke anggota.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin
    participant UI as Halaman Peserta<br/>(Next.js Client)
    participant API as Server Action /<br/>API Route
    participant Auth as NextAuth<br/>Session
    participant DB as PostgreSQL<br/>(Prisma)
    participant Cert as CertificateService
    participant QR as QR Generator
    participant PDF as PDF Generator<br/>(jsPDF)
    participant Storage as Supabase Storage
    participant Notif as NotificationService
    actor Anggota as Anggota

    Admin->>UI: Klik "Tandai Hadir" pada peserta
    UI->>API: POST /kegiatan/{id}/absensi {anggotaId, hadir:true}
    API->>Auth: getServerSession()
    Auth-->>API: { user, role:ADMIN }
    API->>DB: UPDATE anggota_kegiatan SET hadir=true
    DB-->>API: AnggotaKegiatan {id, hadir:true}

    API->>Cert: generate(anggotaKegiatanId)
    Cert->>DB: SELECT anggota & kegiatan
    DB-->>Cert: data lengkap

    Cert->>Cert: nomor = "KT/2026/" + ulid()
    Cert->>QR: createQR(verifyURL + nomor)
    QR-->>Cert: qrCode (base64 PNG)

    Cert->>PDF: render(template, data, qrCode)
    PDF-->>Cert: pdfBuffer

    Cert->>Storage: upload("sertifikat/{nomor}.pdf", pdfBuffer)
    Storage-->>Cert: pdfUrl

    Cert->>DB: INSERT sertifikat
    DB-->>Cert: Sertifikat tersimpan

    Cert->>Notif: kirim(anggota.userId, "Sertifikat Anda terbit")
    Notif->>DB: INSERT notification
    Notif-->>Anggota: notifikasi in-app + email (Resend)

    Cert-->>API: { sertifikat, pdfUrl }
    API->>DB: INSERT audit_logs (CREATE, sertifikat)
    API-->>UI: 200 OK { pdfUrl }
    UI-->>Admin: Toast "Sertifikat berhasil diterbitkan"
```

---

### 3.4 Activity Diagram — Proses Utama: **Pendaftaran Kegiatan & Penerbitan Sertifikat**

```mermaid
flowchart TD
    Start([Mulai]) --> A1[Admin membuat Kegiatan baru]
    A1 --> A2[Sistem menyimpan kegiatan<br/>status=UPCOMING]
    A2 --> A3[Sistem mengirim notifikasi ke seluruh Anggota]
    A3 --> B1{Anggota tertarik?}
    B1 -- Tidak --> EndNo([Selesai - tidak ikut])
    B1 -- Ya --> B2[Anggota mendaftar / di-assign Admin]
    B2 --> B3[Sistem menyimpan AnggotaKegiatan<br/>hadir=false]

    B3 --> C1[Hari pelaksanaan kegiatan]
    C1 --> C2[Admin mengubah status=ONGOING]
    C2 --> C3[Admin menandai kehadiran peserta]

    C3 --> D1{hadir == true?}
    D1 -- Tidak --> D2[Update hadir=false<br/>tidak ada sertifikat]
    D2 --> EndNoCert([Selesai - tanpa sertifikat])

    D1 -- Ya --> E1[Generate nomor sertifikat unik]
    E1 --> E2[Generate QR Code<br/>verifikasi]
    E2 --> E3[Render PDF dengan jsPDF]
    E3 --> E4[Upload PDF ke Supabase Storage]
    E4 --> E5[Simpan record Sertifikat di DB]
    E5 --> E6[Kirim notifikasi ke Anggota]
    E6 --> F1[Anggota menerima notifikasi]
    F1 --> F2[Anggota mengunduh sertifikat<br/>dari halaman /member/sertifikat]

    F2 --> G1[Admin menutup kegiatan<br/>status=SELESAI]
    G1 --> G2[Sistem mencatat ke Audit Log]
    G2 --> EndOk([Selesai - sertifikat diterbitkan])
```



---

## 4. Implementation

### 4.1 Strategi Implementasi

Implementasi mengikuti pendekatan **iterative-incremental** (sprint 2 minggu) di atas
fondasi **PPDIO**. Sistem dibangun sebagai *full-stack monolith* berbasis **Next.js
App Router** dengan **Server Actions** sebagai mekanisme RPC utama, sehingga tidak
membutuhkan backend terpisah.

```mermaid
gantt
    title Roadmap Implementasi (12 Minggu)
    dateFormat YYYY-MM-DD
    section Persiapan
    Setup Repo & CI/CD          :a1, 2026-06-01, 5d
    Setup DB Schema (Prisma)    :a2, after a1, 4d
    Auth (NextAuth + RBAC)      :a3, after a2, 5d
    section Core
    Modul Anggota               :b1, after a3, 7d
    Modul Kegiatan + Absensi    :b2, after b1, 10d
    Sertifikat ber-QR + PDF     :b3, after b2, 7d
    section Konten
    Berita / Artikel + Editor   :c1, after b3, 7d
    Galeri & Program            :c2, after c1, 5d
    section Keuangan
    Transaksi Keuangan          :d1, after c2, 7d
    Iuran Anggota               :d2, after d1, 4d
    section Partisipasi
    Aspirasi                    :e1, after d2, 4d
    E-Voting (Polling)          :e2, after e1, 5d
    Notifikasi                  :e3, after e2, 4d
    section Finalisasi
    SUS & Audit Log             :f1, after e3, 5d
    UAT & Bug-Fix               :f2, after f1, 7d
    Deployment Produksi         :f3, after f2, 3d
```

### 4.2 Langkah-Langkah Implementasi

| # | Tahap | Aktivitas Kunci | Output |
|---|---|---|---|
| 1 | **Setup Lingkungan** | Inisialisasi monorepo Next.js 16, TypeScript strict, ESLint, Tailwind v4. | Repo siap pakai. |
| 2 | **Database Design** | Definisi `schema.prisma` (15+ model), migrasi awal. | DB ter-provision. |
| 3 | **Authentication** | NextAuth v5 + Prisma adapter + bcrypt; middleware RBAC. | Login bekerja, role-guard aktif. |
| 4 | **Core Modules** | Build modul Anggota → Kegiatan → Sertifikat (jalur kritis). | Fitur inti operasional. |
| 5 | **Content Modules** | Editor TipTap, slug auto, sanitasi DOMPurify. | Berita/Artikel publish. |
| 6 | **Finance Modules** | CRUD Transaksi & Iuran, chart Recharts, ekspor `xlsx` & `jspdf`. | Laporan keuangan. |
| 7 | **Engagement** | Aspirasi, Polling (anti double-vote), Notifikasi (in-app + Resend email). | Interaksi 2 arah. |
| 8 | **Quality & Audit** | SUS form, AuditLog interceptor di Server Actions. | Telemetri kepuasan & jejak. |
| 9 | **Testing** | Unit (Vitest), Integration, E2E (Playwright), UAT bersama pengurus. | Bug fixed; UAT sign-off. |
| 10 | **Deployment** | Vercel (FE+BE), Supabase (DB+Storage), domain & SSL, env vars. | Sistem live. |
| 11 | **Hardening** | Rate-limit, header keamanan (CSP, HSTS), backup harian. | Sistem siap produksi. |
| 12 | **Hand-Over** | Dokumentasi user, training pengurus, runbook operasional. | Tim siap mengoperasikan. |

### 4.3 Persiapan Perangkat Keras (Hardware)

#### 4.3.1 Hardware Pengembangan (per developer)

| Komponen | Spesifikasi Minimum | Spesifikasi Direkomendasikan |
|---|---|---|
| CPU | Intel Core i5 / AMD Ryzen 5 (4 core) | Apple M2 / Ryzen 7 (8 core) |
| RAM | 8 GB | 16 GB |
| Storage | 256 GB SSD | 512 GB NVMe SSD |
| Display | 1366×768 | 1920×1080 atau lebih |
| OS | Windows 10 / macOS 12 / Ubuntu 22.04 | Windows 11 / macOS 14 / Ubuntu 24.04 |
| Internet | 5 Mbps | 25 Mbps |

#### 4.3.2 Hardware Server / Hosting (Produksi)

Karena menggunakan **PaaS** (Vercel + Supabase), tidak perlu provisioning fisik.
Estimasi tier yang dibutuhkan untuk skala 1.000 anggota:

| Layanan | Tier | Spek |
|---|---|---|
| Vercel (Hosting Next.js) | Pro | Serverless, 1 TB bandwidth, 1.000 GB-h compute |
| Supabase PostgreSQL | Pro | 8 GB DB, 100 GB egress, daily backup |
| Supabase Storage | Pro | 100 GB file storage |
| Resend (Email) | Pro | 50.000 email/bulan |
| Domain + SSL | – | `.id` / `.or.id`, SSL otomatis (Let's Encrypt) |

#### 4.3.3 Hardware Pengguna Akhir

| Pengguna | Perangkat | Browser |
|---|---|---|
| Admin | Laptop / Desktop dengan layar ≥ 13" | Chrome / Edge versi terbaru |
| Anggota | Smartphone Android 10+ / iOS 14+ | Chrome / Safari |
| Publik | Smartphone / Desktop | Browser modern apa pun |

### 4.4 Persiapan Perangkat Lunak (Software)

#### 4.4.1 Stack Teknologi

| Lapisan | Teknologi | Versi |
|---|---|---|
| **Bahasa** | TypeScript | 5.x |
| **Frontend Framework** | Next.js (App Router) | 16.x |
| **UI Library** | React | 19.x |
| **Styling** | Tailwind CSS | 4.x |
| **Komponen UI** | Radix UI + shadcn/ui pattern | latest |
| **Form & Validasi** | React Hook Form + Zod | 7.x / 3.x |
| **State Management** | Zustand | 5.x |
| **Rich Text Editor** | TipTap | 3.x |
| **Charting** | Recharts | 3.x |
| **ORM** | Prisma | 7.x |
| **Database** | PostgreSQL | 14+ |
| **Auth** | NextAuth.js | v5 (beta) |
| **Hashing** | bcryptjs | 3.x |
| **Storage** | Supabase Storage | – |
| **Email** | Resend | 6.x |
| **PDF** | jsPDF + jspdf-autotable | 4.x / 5.x |
| **Excel** | xlsx (SheetJS) | 0.18.x |
| **Sanitasi** | DOMPurify / isomorphic-dompurify | 3.x |
| **Animasi** | Framer Motion | 12.x |
| **Notif Toast** | Sonner | 2.x |

#### 4.4.2 Tools Pengembangan

| Kategori | Tool |
|---|---|
| Editor | VS Code / Cursor + ekstensi Prisma, Tailwind, ESLint |
| Version Control | Git + GitHub |
| Package Manager | npm |
| API Testing | Thunder Client / Postman |
| DB GUI | Prisma Studio / pgAdmin / TablePlus |
| Design | Figma (mockup & flow) |
| Project Mgmt | GitHub Projects (Kanban) |
| CI/CD | GitHub Actions + Vercel Auto-Deploy |
| Monitoring | Vercel Analytics + Supabase Logs |
| Error Tracking | Sentry (opsional) |

#### 4.4.3 Konfigurasi Environment Variables

```bash
# .env.local (contoh)
DATABASE_URL="postgresql://user:pass@host:5432/karangtaruna"
NEXTAUTH_SECRET="<random-32-byte>"
NEXTAUTH_URL="https://karangtaruna.example.id"
SUPABASE_URL="https://<proj>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<key>"
SUPABASE_BUCKET="karangtaruna"
RESEND_API_KEY="re_xxx"
RESEND_FROM="Karang Taruna <noreply@karangtaruna.example.id>"
```

#### 4.4.4 Arsitektur Deployment

```mermaid
flowchart LR
    Pengguna[("Pengguna<br/>(Browser/Mobile)")] -->|HTTPS| CDN[Vercel Edge CDN]
    CDN --> NextJS[Next.js App<br/>SSR/RSC + Server Actions]
    NextJS -->|Prisma| DB[(Supabase<br/>PostgreSQL)]
    NextJS -->|SDK| Storage[(Supabase<br/>Storage)]
    NextJS -->|API| Email[Resend Email]
    NextJS -->|OAuth| Auth[NextAuth Provider]
    GitHub[GitHub Repo] -->|push main| CI[GitHub Actions<br/>+ Vercel Build]
    CI -->|deploy| NextJS
```



---

## 5. Operation

Tahap operasi memastikan sistem **dapat digunakan dengan benar**, **adopsi pengguna
tinggi**, dan **terus berjalan stabil** setelah go-live. Bagian ini mencakup tiga
pilar: (a) Rencana Pengujian, (b) Pelatihan Pengguna, (c) Pemeliharaan & Perbaikan.

### 5.1 Rencana Pengujian Sistem

#### 5.1.1 Strategi Pengujian (Test Pyramid)

```mermaid
flowchart TB
    E2E["E2E Tests<br/>(Playwright)<br/>~10%"]
    INT["Integration Tests<br/>(Vitest + Test DB)<br/>~30%"]
    UNIT["Unit Tests<br/>(Vitest)<br/>~60%"]
    E2E --> INT --> UNIT
```

#### 5.1.2 Jenis & Cakupan Pengujian

| # | Jenis Pengujian | Cakupan | Tools | Penanggung Jawab | Kriteria Lolos |
|---|---|---|---|---|---|
| 1 | **Unit Testing** | Fungsi util, validator Zod, kalkulator SUS, helper sertifikat. | Vitest | Developer | Coverage ≥ 70%. |
| 2 | **Integration Testing** | Server Actions + Prisma terhadap DB test. | Vitest + Postgres test container | Developer | Semua FR-01..24 PASS. |
| 3 | **Component Testing** | Komponen React (form, tabel, dialog). | React Testing Library | Frontend Dev | Tidak ada console error. |
| 4 | **E2E Testing** | Skenario kritis: login → buat kegiatan → absensi → terbit sertifikat → verifikasi. | Playwright | QA | Skenario PASS di Chrome & Firefox. |
| 5 | **Performance Testing** | Load 100 concurrent user pada halaman publik & login. | k6 / Artillery | DevOps | P95 ≤ 500 ms; error rate < 1%. |
| 6 | **Security Testing** | OWASP Top-10 (XSS, CSRF, SQLi, Auth Bypass, IDOR). | OWASP ZAP, npm audit, Snyk | Security | 0 high/critical finding. |
| 7 | **Compatibility Testing** | Multi-browser & multi-device responsive. | BrowserStack | QA | UI konsisten di Chrome/Edge/Firefox/Safari. |
| 8 | **Usability Testing (UAT)** | 10 pengurus + 20 anggota mencoba alur lengkap; kemudian isi SUS. | Tatap muka + form SUS | Project Manager | Skor SUS ≥ 70; kritis bug = 0. |
| 9 | **Regression Testing** | Setiap rilis menjalankan ulang E2E suite. | Playwright (CI) | QA | Semua test PASS sebelum deploy. |
| 10 | **Backup & Recovery Testing** | Simulasi restore dari backup harian. | Supabase / pg_dump | DevOps | RPO ≤ 24 jam, RTO ≤ 2 jam. |

#### 5.1.3 Kriteria Penerimaan (Acceptance Criteria)

Sistem dinyatakan **GO-LIVE** apabila:

- ✅ Semua **FR-01..FR-24** PASS pada UAT.
- ✅ Tidak ada bug **Critical / High** yang belum diperbaiki.
- ✅ Skor SUS rata-rata UAT ≥ **70**.
- ✅ Performance test P95 API ≤ **500 ms**.
- ✅ Penetration test: 0 finding High/Critical.
- ✅ Dokumentasi user manual & runbook lengkap.
- ✅ Sign-off resmi dari Ketua Karang Taruna & Sekretaris.

#### 5.1.4 Cara Pengujian Mendukung Kelancaran Sistem

Strategi piramida (banyak unit test, sedikit E2E) memberi *fast feedback loop*
saat pengembangan dan **mencegah regresi** ketika ada perubahan. UAT menggandeng
pengguna riil sehingga sistem benar-benar **memecahkan masalah operasional**, bukan
sekadar lulus secara teknis.

---

### 5.2 Rencana Pelatihan Pengguna

#### 5.2.1 Segmentasi Pelatihan

| Audiens | Jumlah | Durasi | Format | Materi Inti |
|---|---|---|---|---|
| **Super Admin** | 1–2 | 1 hari (8 jam) | Tatap muka + hands-on | Manajemen admin, audit log, konfigurasi sistem, restore backup. |
| **Admin (Bendahara, Sekretaris, Humas)** | 5–10 | 2 hari (16 jam) | Workshop hands-on | CRUD anggota, kegiatan, absensi, sertifikat, keuangan, konten, polling, aspirasi. |
| **Anggota** | 50–100 | 2 jam | Webinar + video tutorial | Login, profil, kegiatan, sertifikat, iuran, voting, aspirasi. |
| **Publik / Masyarakat** | – | – | Self-service | FAQ + video di halaman "Tentang". |

#### 5.2.2 Materi & Media Pelatihan

| Media | Konten |
|---|---|
| **Buku Manual (PDF)** | Step-by-step screenshot per modul (≥ 80 halaman). |
| **Video Tutorial** | 8 video pendek (3–5 menit) per modul, di-host di YouTube. |
| **Quick-Start Card** | 1 halaman A4 berisi alur 5 langkah utama (cetak). |
| **Sandbox Environment** | URL `staging.karangtaruna.example.id` untuk berlatih tanpa risiko. |
| **FAQ & Helpdesk** | Halaman in-app "Bantuan" + kontak admin via email/WA. |

#### 5.2.3 Metode Evaluasi Pelatihan

1. **Pre-test & Post-test** untuk admin (mengukur peningkatan pemahaman).
2. **Practical Test**: peserta diminta menyelesaikan 5 skenario riil (mis. menerbitkan sertifikat) tanpa bantuan.
3. **Survey Kepuasan Pelatihan** (Likert 1–5) dengan target rata-rata ≥ 4.
4. **Follow-up Session** 2 minggu pasca-pelatihan untuk mengatasi kendala lapangan.

#### 5.2.4 Cara Pelatihan Mendukung Kelancaran Sistem

Pelatihan terstruktur **mengurangi support ticket** hingga 70%, memastikan
**konsistensi data** karena semua admin mengikuti SOP yang sama, dan
**meningkatkan adopsi** sistem oleh anggota — sistem tercanggih sekalipun tidak
berguna jika tidak dipakai.

---

### 5.3 Rencana Pemeliharaan & Perbaikan

Pemeliharaan mengikuti klasifikasi standar ISO/IEC 14764: **Corrective**,
**Adaptive**, **Perfective**, **Preventive**.

#### 5.3.1 Jenis Pemeliharaan

| Jenis | Tujuan | Contoh Aktivitas | Frekuensi |
|---|---|---|---|
| **Corrective** | Memperbaiki bug yang ditemukan setelah rilis. | Hot-fix bug login, perbaikan kalkulasi iuran. | On-demand (SLA tergantung severity). |
| **Adaptive** | Menyesuaikan dengan perubahan eksternal. | Upgrade Next.js / Prisma, kebijakan privasi baru. | Tiap kuartal. |
| **Perfective** | Meningkatkan fitur sesuai feedback. | UI improvement, fitur ekspor PDF baru. | Tiap sprint (2 minggu). |
| **Preventive** | Mencegah kegagalan di masa depan. | Refactor, indexing DB, rotasi secret, dependency audit. | Tiap bulan. |

#### 5.3.2 SLA Penanganan Insiden

| Severity | Definisi | Response Time | Resolution Time |
|---|---|---|---|
| **S1 — Critical** | Sistem down, data loss, security breach. | ≤ 30 menit | ≤ 4 jam |
| **S2 — High** | Modul utama tidak berfungsi (mis. tidak bisa absensi). | ≤ 2 jam | ≤ 1 hari kerja |
| **S3 — Medium** | Bug fungsional non-kritis. | ≤ 1 hari kerja | ≤ 1 minggu |
| **S4 — Low** | UI minor, typo, request enhancement. | ≤ 3 hari kerja | Backlog sprint berikutnya |

#### 5.3.3 Aktivitas Pemeliharaan Rutin

| Frekuensi | Aktivitas |
|---|---|
| **Harian** | Cek health endpoint, monitoring log error, backup otomatis DB. |
| **Mingguan** | Review error tracker (Sentry), review audit log, status uptime report. |
| **Bulanan** | `npm audit fix`, dependency update (PR Renovate/Dependabot), uji restore backup. |
| **Kuartalan** | Major upgrade framework, security audit eksternal, review NFR. |
| **Tahunan** | Penetration test profesional, review arsitektur & kapasitas. |

#### 5.3.4 Monitoring & Observability

| Aspek | Tools | Alert |
|---|---|---|
| Uptime & Latency | Vercel Analytics + UptimeRobot | < 99,5% atau latency > 1 s → email/WA. |
| Error Rate | Sentry | > 1% request error → notifikasi. |
| Database | Supabase Logs + pg_stat | CPU > 80%, slow query > 1 s. |
| Storage | Supabase Dashboard | Quota > 80% → notifikasi. |
| Audit Log | Tabel `audit_logs` | Aksi destructive di luar jam kerja → review. |

#### 5.3.5 Backup & Disaster Recovery

| Parameter | Nilai |
|---|---|
| **Frekuensi Backup** | Harian otomatis (Supabase) + dump mingguan ke off-site (S3). |
| **Retensi** | 30 hari rolling + arsip bulanan 12 bulan. |
| **RPO (Recovery Point Objective)** | ≤ 24 jam |
| **RTO (Recovery Time Objective)** | ≤ 2 jam |
| **DR Drill** | 1× per kuartal (uji restore lengkap). |

#### 5.3.6 Optimisasi (Optimize — Tahap PPDIO Terakhir)

Setelah operasi berjalan, dilakukan optimisasi berkelanjutan berbasis data:

1. **Analitik Penggunaan** — Vercel Analytics + dashboard custom untuk
   mengidentifikasi modul jarang dipakai (kandidat penyederhanaan UI).
2. **Skor SUS Berkala** — survei tiap 6 bulan; jika skor turun, lakukan
   *user research* dan iterasi UI.
3. **Performance Tuning** — query indexing, ISR/RSC caching pada halaman publik,
   kompresi gambar otomatis (Next.js Image).
4. **Cost Optimization** — evaluasi tier Vercel/Supabase berdasarkan trafik nyata.
5. **Roadmap v2** — fitur yang masuk *out-of-scope* v1 (mobile app, payment
   gateway, WhatsApp notif) dapat masuk roadmap v2 setelah ROI v1 terukur.

#### 5.3.7 Cara Pemeliharaan Mendukung Kelancaran Sistem

Pemeliharaan terjadwal **mencegah** kegagalan (preventive) sekaligus **menjaga**
relevansi fitur dengan kebutuhan organisasi (perfective/adaptive). SLA insiden
yang jelas membuat pengguna **percaya** pada sistem; backup & DR melindungi
**aset data** organisasi yang berharga; sementara optimisasi berkelanjutan
memastikan sistem **berkembang seiring** pertumbuhan Karang Taruna.

---

## Penutup

Dokumen SRS ini menjadi **acuan tunggal** (single source of truth) bagi seluruh
pemangku kepentingan — pemilik produk (Ketua Karang Taruna), pengembang, QA, dan
pengguna akhir — selama siklus hidup Sistem Informasi Manajemen Karang Taruna.
Pembaruan dokumen ini dilakukan melalui mekanisme *change request* yang
disepakati bersama dan ditandai dengan kenaikan versi.

| Versi | Tanggal | Perubahan | Penyusun |
|---|---|---|---|
| 1.0 | 22 Mei 2026 | Versi awal — 8 luaran PPDIO lengkap. | Tim Pengembang |

> **Pemetaan 8 Luaran ↔ Dokumen**
>
> 1. Kebutuhan bisnis & tujuan sistem → §1.2, §1.3
> 2. Manfaat sistem → §1.4
> 3. Kebutuhan fungsional & non-fungsional → §2.2, §2.3
> 4. Asumsi & batasan → §2.4, §2.5
> 5. Use Case Diagram + deskripsi → §3.1
> 6. Class Diagram → §3.2
> 7. Sequence Diagram → §3.3
> 8. Activity Diagram → §3.4
>
> Implementation (§4) dan Operation (§5) melengkapi keseluruhan siklus PPDIO.
