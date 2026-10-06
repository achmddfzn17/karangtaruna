# Skema Basis Data — SIM Karang Taruna RW 10 Mangga Dua Selatan

Basis data relasional **PostgreSQL** (dihosting di Supabase), dipetakan dengan **Prisma ORM**
(`prisma/schema.prisma`). Nama fisik tabel memakai snake_case (`@@map`).

> **Catatan model:** Gambar 2 pada naskah menampilkan model logis yang
> disederhanakan (6 entitas inti). Dokumen ini mendokumentasikan **skema fisik
> aktual hasil implementasi**, yang memperluas model tersebut menjadi 24 tabel.
> Pemetaan entitas ERD → tabel fisik ada pada tabel di bawah.

## Pemetaan ERD (Gambar 2) → tabel fisik

| Entitas pada ERD | Tabel fisik implementasi |
|---|---|
| USER | `users` |
| MEMBER | `anggota` |
| FINANCE_TRANSACTION | `transaksi_keuangan` (+ `kategori_transaksi`, `iuran_anggota`) |
| ACTIVITY | `kegiatan` (+ `anggota_kegiatan`, `sertifikat`) |
| DOCUMENTATION | `galeri_item` |
| NOTIFICATION | `notifications` (+ `notification_reads`) |

## 1. Modul autentikasi (NextAuth v5 / Auth.js + PrismaAdapter)

### users — akun pengguna & peran
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | |
| email | String | unik |
| emailVerified | DateTime? | |
| image | String? | |
| password | String? | hash bcrypt (bcryptjs); null untuk akun non-kredensial |
| role | Enum Role | `SUPER_ADMIN` \| `ADMIN` \| `ANGGOTA` (default `ANGGOTA`) — dasar RBAC |
| createdAt / updatedAt | DateTime | |

Relasi: `accounts`, `sessions`, `anggota` (1:1 opsional), `admin` (1:1 opsional),
`susResponses`, `notifications`, `notificationReads`, `aspirasi`, `votes`.

### accounts — akun penyedia auth (adapter NextAuth)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → `users.id` (Cascade) |
| type / provider / providerAccountId | String | unik gabungan (provider, providerAccountId) |
| refresh_token / access_token / id_token | Text? | |
| expires_at / token_type / scope / session_state | — | |

### sessions — sesi login
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| sessionToken | String | unik |
| userId | String | FK → `users.id` (Cascade) |
| expires | DateTime | |

### verification_tokens — token verifikasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| identifier | String | unik gabungan (identifier, token) |
| token | String | unik |
| expires | DateTime | |

## 2. Modul keanggotaan

### admins — profil administrator
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | unik, FK → `users.id` (Cascade) |
| nip | String? | unik |
| phone | String? | |
| jabatan | String? | |
| createdAt / updatedAt | DateTime | |

### anggota — data anggota Karang Taruna
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String? | unik, FK → `users.id` (Cascade) — akun login anggota |
| namaLengkap | String | |
| nik | String | unik — **data pribadi** |
| tempatLahir | String? | |
| tanggalLahir | DateTime? | **data pribadi** |
| jenisKelamin | Enum | `LAKI_LAKI` \| `PEREMPUAN` |
| alamat | Text? | **data pribadi** — akses dibatasi per peran (UU PDP) |
| noHp | String? | **data pribadi** — akses dibatasi per peran (UU PDP) |
| email | String? | unik |
| foto / pekerjaan / pendidikan | String? | |
| status | Enum | `AKTIF` \| `NON_AKTIF` \| `ALUMNI` (default `AKTIF`) |
| tanggalGabung | DateTime | default now() |
| createdAt / updatedAt | DateTime | |

Relasi: `kegiatan` (via `anggota_kegiatan`), `iuran` (via `iuran_anggota`).

## 3. Modul kegiatan

### kegiatan — agenda kegiatan organisasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| nama | String | |
| deskripsi | Text? | |
| jenis | Enum | `SOSIAL` \| `PENDIDIKAN` \| `EKONOMI` \| `OLAHRAGA` \| `SENI_BUDAYA` \| `LAINNYA` |
| tanggalMulai | DateTime | index |
| tanggalSelesai | DateTime? | |
| lokasi | String? | |
| anggaran | Float? | |
| thumbnail | String? | |
| status | Enum | `UPCOMING` \| `ONGOING` \| `SELESAI` \| `DIBATALKAN` (default `UPCOMING`); index (status, tanggalMulai) |
| createdAt / updatedAt | DateTime | |

Relasi: `peserta` (via `anggota_kegiatan`), `galeri` (via `galeri_item`).

### anggota_kegiatan — peserta & kehadiran (M:N anggota ↔ kegiatan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| anggotaId | String | FK → `anggota.id` (Cascade); unik gabungan (anggotaId, kegiatanId) |
| kegiatanId | String | FK → `kegiatan.id` (Cascade); index |
| hadir | Boolean | default false |
| createdAt | DateTime | |

Relasi: `sertifikat` (1:1 opsional).

### sertifikat — sertifikat peserta kegiatan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| anggotaKegiatanId | String | unik, FK → `anggota_kegiatan.id` (Cascade) |
| nomorSertifikat | String | unik; index |
| namaAnggota / namaKegiatan | String | |
| tanggalKegiatan | DateTime | |
| tanggalTerbit | DateTime | default now() |
| qrCode / pdfUrl | String? | URL gambar QR / PDF |
| createdAt / updatedAt | DateTime | |

### galeri_item — arsip digital (foto/video) kegiatan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| judul | String | |
| deskripsi | String? | |
| url | String | berkas tersimpan di Supabase Storage |
| type | Enum | `FOTO` \| `VIDEO` (default `FOTO`) |
| kegiatanId | String? | FK → `kegiatan.id` (Cascade) |
| createdAt / updatedAt | DateTime | |

## 4. Modul keuangan

### kategori_transaksi — kategori kas
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| nama | String | |
| jenis | Enum | `MASUK` \| `KELUAR` |
| keterangan | String? | |
| createdAt | DateTime | |

### transaksi_keuangan — pemasukan & pengeluaran kas
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| tanggal | DateTime | index (tanggal desc), index (jenis, tanggal) |
| keterangan | String | |
| jumlah | Float | nominal (Rp) |
| jenis | Enum | `MASUK` \| `KELUAR` |
| kategoriId | String? | FK → `kategori_transaksi.id` (SetNull); index |
| bukti | String? | URL bukti (Supabase Storage) |
| createdAt / updatedAt | DateTime | |

### iuran_anggota — iuran bulanan anggota
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| anggotaId | String | FK → `anggota.id` (Cascade); unik gabungan (anggotaId, bulan, tahun) |
| bulan | Int | 1–12; index (bulan, tahun) |
| tahun | Int | |
| jumlah | Float | |
| tanggalBayar | DateTime | default now() |
| keterangan | String? | |
| createdAt | DateTime | |

## 5. Modul konten

### program — daftar program kerja
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| nama | String | |
| deskripsi | Text? | |
| thumbnail / icon | String? | |
| status | Boolean | default true |
| urutan | Int | default 0 |
| createdAt / updatedAt | DateTime | |

### berita — berita organisasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| judul | String | |
| slug | String | unik |
| isi | Text | |
| ringkasan | Text? | |
| thumbnail | String? | |
| tags | String[] | |
| kategori | String? | |
| status | Enum | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` (default `DRAFT`); index (status, publishedAt desc) |
| publishedAt | DateTime? | |
| viewCount | Int | default 0 |
| createdAt / updatedAt | DateTime | |

### artikel — artikel organisasi
Struktur kolom identik dengan `berita`.

## 6. Modul partisipasi

### aspirasi — kotak aspirasi anggota
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String? | FK → `users.id` (SetNull) |
| nama | String? | |
| judul | String | |
| pesan | Text | |
| kategori | String? | |
| status | Enum | `PENDING` \| `DIPROSES` \| `SELESAI` \| `DITOLAK` (default `PENDING`); index (status, createdAt desc) |
| balasan | Text? | |
| createdAt / updatedAt | DateTime | index (userId, createdAt desc) |

### polling — e-voting
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| judul | String | |
| deskripsi | Text? | |
| isActive | Boolean | default true |
| expiresAt | DateTime? | |
| createdAt / updatedAt | DateTime | |

Relasi: `options` (via `polling_options`).

### polling_options — opsi jawaban polling
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| pollingId | String | FK → `polling.id` (Cascade); index |
| label | String | |
| createdAt / updatedAt | DateTime | |

Relasi: `votes` (via `votes`).

### votes — suara e-voting
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → `users.id` (Cascade); unik gabungan (userId, pollingId) — satu suara per pengguna per polling |
| pollingId | String | index |
| optionId | String | FK → `polling_options.id` (Cascade); index |
| createdAt | DateTime | |

## 7. Modul notifikasi

### notifications — notifikasi & informasi organisasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| title | String | |
| message | String | |
| type | String | default `"info"` |
| isRead | Boolean | default false |
| userId | String? | FK → `users.id` (Cascade); null = siaran ke semua; index (userId, createdAt desc), (userId, isRead) |
| createdAt | DateTime | |

Relasi: `reads` (via `notification_reads`).

### notification_reads — status baca per pengguna
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| notificationId | String | FK → `notifications.id` (Cascade); unik gabungan (notificationId, userId) |
| userId | String | FK → `users.id` (Cascade); index |
| readAt | DateTime | default now() |

## 8. Modul evaluasi

### sus_responses — jawaban kuesioner SUS
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId | String? | FK → `users.id` (SetNull) |
| responden | String? | kode anonim responden (R1–R12) |
| q1 … q10 | Int | skor Likert 1–5 per butir |
| score | Float | skor SUS akhir (0–100) |
| kategori | String | kategori interpretasi skor |
| createdAt | DateTime | |

Dataset mentah 12 responden tersedia di `docs/SUS_DATA_MENTAH_12_RESPONDEN.csv`
(rata-rata 73,96 — lihat naskah §4.4).

## 9. Modul audit

### audit_logs — jejak audit aktivitas
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | PK |
| userId / userName | String? | pelaku aksi |
| action | String | CREATE, UPDATE, DELETE, LOGIN, dsb. |
| module | String | anggota, kegiatan, keuangan, dsb.; index (module, createdAt desc) |
| targetId / targetName | String? | objek yang dikenai aksi |
| detail | Text? | |
| ipAddress | String? | |
| createdAt | DateTime | index (userId, createdAt desc) |

## Relasi utama (1:N, kecuali dinyatakan lain)

| Dari (1) | Ke (N) | Keterangan |
|---|---|---|
| users | accounts, sessions | adapter NextAuth |
| users | admins | profil admin (1:1) |
| users | anggota | akun login anggota (1:1, opsional) |
| anggota | anggota_kegiatan | peserta kegiatan (M:N via tabel asosiasi) |
| kegiatan | anggota_kegiatan | peserta kegiatan |
| anggota_kegiatan | sertifikat | sertifikat peserta (1:1) |
| kegiatan | galeri_item | arsip digital kegiatan |
| kategori_transaksi | transaksi_keuangan | kategori kas |
| anggota | iuran_anggota | iuran bulanan |
| polling | polling_options | opsi e-voting |
| polling_options | votes | perolehan suara |
| users | notifications | notifikasi personal (null = siaran) |
| notifications | notification_reads | status baca per pengguna |
| users | aspirasi, sus_responses | partisipasi & evaluasi |

## Keamanan & perlindungan data

- **Autentikasi:** NextAuth v5 (Auth.js) + PrismaAdapter; provider Credentials
  (email + kata sandi, dengan peran opsional) — `src/auth.ts`, `src/auth.config.ts`.
- **Hash kata sandi:** bcrypt (melalui `bcryptjs`) — terverifikasi di `src/auth.ts`
  dan endpoint reset kata sandi.
- **Validasi masukan:** Zod (`credentialsSchema` di `src/auth.ts`,
  `src/lib/validations.ts`, `src/app/api/sus/route.ts`).
- **RBAC:** enum `Role` (`SUPER_ADMIN`/`ADMIN`/`ANGGOTA`) ditegakkan di
  `src/proxy.ts`: rute `/dashboard` hanya untuk `ADMIN`/`SUPER_ADMIN`, rute
  `/member` untuk anggota; pengguna tak terautentikasi dialihkan ke halaman login.
- **Data pribadi** (`nik`, `tanggalLahir`, `alamat`, `noHp` pada `anggota`):
  akses dibatasi per peran sesuai UU PDP — lihat naskah §4.2.4.
- **Jejak audit:** seluruh aksi penting per modul dicatat di `audit_logs`.
- **Pencadangan:** mengandalkan mekanisme cadangan otomatis platform Supabase;
  tidak ada skrip/prosedur backup terjadwal di repositori ini. Prosedur
  backup–restore eksplisit merupakan agenda handover (lihat naskah §4.2.4 dan §5.2).

## Reproduksibilitas

- Skema dikelola via Prisma (`prisma/schema.prisma`); migrasi di `prisma/migrations/`.
- Dokumen ini disusun dari `prisma/schema.prisma` pada komit `f488eee`
  (diperiksa 2026-10-07). Bila skema berubah, perbarui dokumen ini mengikuti
  perubahan tersebut.
