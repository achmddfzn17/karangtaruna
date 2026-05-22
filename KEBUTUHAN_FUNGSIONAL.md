# KEBUTUHAN FUNGSIONAL SISTEM
## Sistem Informasi Manajemen Karang Taruna Berbasis Web

---

## LATAR BELAKANG

Karang Taruna merupakan organisasi kepemudaan di tingkat desa/kelurahan yang berperan dalam pemberdayaan generasi muda melalui kegiatan sosial, pendidikan, ekonomi, dan seni budaya. Dalam menjalankan operasionalnya, organisasi ini mengelola berbagai aspek seperti keanggotaan, kegiatan, keuangan, iuran anggota, dokumentasi, hingga komunikasi internal.

Saat ini sebagian besar pengelolaan masih dilakukan secara manual menggunakan dokumen fisik, spreadsheet terpisah, dan grup pesan singkat. Akibatnya muncul beberapa permasalahan: data anggota sulit dilacak dan rawan duplikasi, dokumentasi kegiatan tersebar di berbagai media, pencatatan iuran dan keuangan tidak transparan, sertifikat keikutsertaan kegiatan harus dibuat manual satu per satu, serta tidak ada kanal resmi bagi anggota dan masyarakat untuk menyampaikan aspirasi maupun mengikuti pemilihan internal.

Berdasarkan permasalahan tersebut, dibutuhkan sebuah **Sistem Informasi Manajemen Karang Taruna** berbasis web yang dapat mengintegrasikan seluruh proses tersebut dalam satu platform terpadu. Sistem ini mengotomatisasi penerbitan sertifikat dengan QR code, menyediakan kanal aspirasi dan e-voting, mempublikasikan berita & kegiatan ke masyarakat luas, serta menyediakan laporan keuangan dan iuran yang transparan.

**Permasalahan yang diselesaikan sistem ini:**
- Pendataan anggota masih manual dan tersebar, sulit untuk pelacakan riwayat keaktifan
- Dokumentasi kegiatan dan publikasi informasi tidak terpusat
- Pencatatan iuran dan keuangan organisasi tidak transparan kepada anggota
- Penerbitan sertifikat keikutsertaan kegiatan harus dibuat manual
- Tidak ada kanal resmi untuk aspirasi anggota dan masyarakat
- Pemilihan internal organisasi (e-voting) belum terdigitalisasi
- Pengurus tidak memiliki dashboard terpusat untuk memantau aktivitas organisasi

---

## DESKRIPSI SISTEM

**Sistem Informasi Karang Taruna** adalah aplikasi berbasis web yang dirancang untuk mengelola seluruh operasional organisasi karang taruna secara terpadu. Sistem terdiri dari tiga area utama: **halaman publik** (informasi dan publikasi untuk masyarakat), **area anggota** (member dashboard untuk anggota terdaftar), dan **dashboard admin** (backoffice untuk pengurus). Fitur unggulan sistem mencakup penerbitan sertifikat otomatis dengan QR code verifikasi, e-voting internal, kanal aspirasi, manajemen keuangan & iuran, serta survei kebergunaan sistem (SUS).

### AKTOR & HAK AKSES

| Fitur / Halaman | Pengunjung | Anggota | Admin | Super Admin |
|---|---|---|---|---|
| Halaman Publik (berita, artikel, galeri, program) | Ya | Ya | Ya | Ya |
| SUS Survey | Ya | Ya | Ya | Ya |
| Aspirasi (kirim) | Ya | Ya | Ya | Ya |
| Login / Registrasi | Ya | - | - | - |
| Member Dashboard (profil, kegiatan, sertifikat) | Tidak | Ya | Ya | Ya |
| E-Voting (memberikan suara) | Tidak | Ya | Tidak | Tidak |
| Lihat Iuran & Keuangan Pribadi | Tidak | Ya | Ya | Ya |
| Dashboard Admin (backoffice) | Tidak | Tidak | Ya | Ya |
| Manajemen Anggota | Tidak | Tidak | Ya | Ya |
| Manajemen Kegiatan & Absensi | Tidak | Tidak | Ya | Ya |
| Penerbitan Sertifikat | Tidak | Tidak | Ya | Ya |
| CMS (Berita, Artikel, Galeri) | Tidak | Tidak | Ya | Ya |
| Manajemen Iuran & Keuangan | Tidak | Tidak | Ya | Ya |
| Kelola Aspirasi & Voting | Tidak | Tidak | Ya | Ya |
| Kelola Admin & Audit Log | Tidak | Tidak | Tidak | Ya |

---

## KEBUTUHAN FUNGSIONAL

### F001 — Fitur Autentikasi (Login & Logout)

| | |
|---|---|
| **Aktor / Role** | Anggota / Admin / Super Admin |
| **Deskripsi** | Sistem menyediakan autentikasi berbasis NextAuth dengan email & password. Role pengguna menentukan halaman tujuan setelah login. |
| **Alur Proses** | 1. Pengguna membuka halaman login. 2. Memasukkan email dan password. 3. Sistem memvalidasi credentials & status akun. 4. Sistem membuat session berisi `user_id` dan `role`. 5. Anggota diarahkan ke `/member/dashboard`, Admin/Super Admin ke `/dashboard`. |
| **Kriteria Penerimaan** | Login berhasil hanya dengan credentials valid; pesan error informatif untuk input salah; redirect sesuai role; session aktif hingga logout / expired. |

---

### F002 — Fitur Registrasi Anggota

| | |
|---|---|
| **Aktor / Role** | Pengunjung (calon anggota) |
| **Deskripsi** | Calon anggota dapat mendaftarkan diri secara mandiri. Akun baru dibuat dengan role `ANGGOTA` dan terhubung dengan data biodata anggota. |
| **Alur Proses** | 1. Pengunjung membuka halaman registrasi. 2. Mengisi form: nama, email, password, NIK, tempat/tanggal lahir, jenis kelamin, alamat, no. HP. 3. Sistem memvalidasi keunikan email & NIK. 4. Sistem membuat record `User` (role ANGGOTA) dan `Anggota` dengan status `AKTIF`. 5. Anggota dapat langsung login. |
| **Kriteria Penerimaan** | Email & NIK unik; password ter-hash (bcrypt); validasi format input berjalan; data tersimpan di tabel `users` dan `anggota`. |

---

### F003 — Fitur Manajemen Anggota (Backoffice)

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin |
| **Deskripsi** | Admin dapat melakukan CRUD data anggota, mengubah status (Aktif / Non-Aktif / Alumni), serta membuatkan akun login untuk anggota yang belum memiliki akun. |
| **Alur Proses** | 1. Admin membuka menu Anggota. 2. Sistem menampilkan daftar anggota dengan filter status. 3. Admin dapat menambah, mengedit, atau menghapus anggota. 4. Admin dapat mengakses halaman "Buat Akun" untuk anggota yang belum punya `userId`. 5. Sistem menyimpan perubahan ke tabel `anggota`. |
| **Kriteria Penerimaan** | NIK & email anggota unik; status anggota dapat diubah; foto anggota tersimpan di Supabase Storage; akun login dapat dibuatkan oleh admin untuk anggota existing. |

---

### F004 — Fitur Manajemen Kegiatan

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin |
| **Deskripsi** | Admin dapat membuat, mengedit, dan menghapus kegiatan. Setiap kegiatan memiliki jenis (Sosial, Pendidikan, Ekonomi, Olahraga, Seni Budaya, Lainnya), status (Upcoming / Ongoing / Selesai / Dibatalkan), tanggal, lokasi, anggaran, dan thumbnail. |
| **Alur Proses** | 1. Admin membuka menu Kegiatan. 2. Mengisi form: nama, deskripsi, jenis, tanggal mulai/selesai, lokasi, anggaran, thumbnail. 3. Admin menambahkan peserta dari daftar anggota. 4. Status kegiatan dapat di-update sesuai progres. |
| **Kriteria Penerimaan** | Kegiatan tersimpan di tabel `kegiatan`; peserta tersimpan di `anggota_kegiatan` (unik per anggota-kegiatan); thumbnail tersimpan di storage; status kegiatan dapat diperbarui. |

---

### F005 — Fitur Absensi Kegiatan

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin |
| **Deskripsi** | Sistem mencatat kehadiran anggota pada setiap kegiatan. Status `hadir` pada peserta menjadi syarat penerbitan sertifikat. |
| **Alur Proses** | 1. Admin membuka halaman peserta kegiatan. 2. Sistem menampilkan daftar anggota terdaftar. 3. Admin mencentang anggota yang hadir. 4. Sistem mengupdate field `hadir` di `anggota_kegiatan`. |
| **Kriteria Penerimaan** | Hanya peserta terdaftar yang dapat ditandai hadir; perubahan tersimpan real-time; data kehadiran menjadi sumber data untuk laporan & sertifikat. |

---

### F006 — Fitur Penerbitan Sertifikat dengan QR Code

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin (penerbitan); Publik (verifikasi) |
| **Deskripsi** | Sistem menerbitkan sertifikat keikutsertaan otomatis untuk anggota yang `hadir` di sebuah kegiatan, lengkap dengan nomor sertifikat unik dan QR code yang mengarah ke halaman verifikasi `/verify/[nomor]`. Sertifikat dapat diunduh sebagai PDF. |
| **Alur Proses** | 1. Admin membuka menu Sertifikat. 2. Memilih kegiatan dengan peserta yang sudah hadir. 3. Sistem generate nomor sertifikat unik & QR code. 4. Sistem menyimpan record di tabel `sertifikat`. 5. Sertifikat dapat di-generate ke PDF (jsPDF) untuk diunduh atau dibagikan ke anggota. 6. Pihak ketiga dapat memindai QR code untuk verifikasi keaslian. |
| **Kriteria Penerimaan** | Nomor sertifikat unik per kegiatan-anggota; QR code terbaca dan mengarah ke halaman verifikasi; halaman verifikasi menampilkan nama anggota, kegiatan, dan tanggal; PDF dapat diunduh. |

---

### F007 — Fitur Manajemen Iuran Anggota

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin (input); Anggota (lihat) |
| **Deskripsi** | Sistem mencatat pembayaran iuran bulanan setiap anggota. Anggota dapat melihat status iuran pribadinya, sedangkan admin melihat rekap iuran seluruh anggota per bulan/tahun. |
| **Alur Proses** | 1. Admin membuka menu Iuran. 2. Memilih anggota, bulan, tahun, dan jumlah pembayaran. 3. Sistem menyimpan ke tabel `iuran_anggota` (unik per anggota-bulan-tahun). 4. Anggota dapat melihat riwayat iuran pribadi dan tunggakan di member dashboard. |
| **Kriteria Penerimaan** | Tidak boleh ada duplikasi iuran (anggota + bulan + tahun harus unik); rekap iuran dapat difilter per bulan/tahun; anggota hanya melihat iuran miliknya. |

---

### F008 — Fitur Manajemen Keuangan Organisasi

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin |
| **Deskripsi** | Sistem mencatat transaksi keuangan organisasi (kas masuk dan keluar) dengan kategorisasi. Sistem menampilkan ringkasan saldo, total pemasukan, dan total pengeluaran beserta grafik tren bulanan. |
| **Alur Proses** | 1. Admin membuka menu Keuangan. 2. Mengisi form transaksi: tanggal, jenis (MASUK/KELUAR), kategori, jumlah, keterangan, bukti (opsional). 3. Sistem menyimpan ke tabel `transaksi_keuangan`. 4. Dashboard menampilkan ringkasan & grafik (Recharts). 5. Laporan dapat diekspor ke Excel/PDF. |
| **Kriteria Penerimaan** | Transaksi terklasifikasi MASUK/KELUAR; saldo dihitung otomatis; bukti transaksi tersimpan di storage; ekspor laporan berjalan. |

---

### F009 — Fitur CMS Berita & Artikel

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin (kelola); Publik (baca) |
| **Deskripsi** | Sistem menyediakan CMS berita & artikel dengan editor WYSIWYG (TipTap). Konten memiliki status (DRAFT / PUBLISHED / ARCHIVED), slug unik, tags, kategori, dan view counter. Hanya konten PUBLISHED yang muncul di halaman publik. |
| **Alur Proses** | 1. Admin membuka menu Berita atau Artikel. 2. Mengisi form: judul, isi (TipTap), ringkasan, thumbnail, tags, kategori, status. 3. Sistem auto-generate slug dari judul. 4. Konten dengan status PUBLISHED otomatis tampil di `/berita` dan `/artikel`. 5. View count bertambah otomatis saat dikunjungi. |
| **Kriteria Penerimaan** | Slug unik; konten DRAFT/ARCHIVED tidak tampil di publik; SEO-friendly URL; sanitasi HTML dengan DOMPurify; gambar di-upload ke Supabase Storage. |

---

### F010 — Fitur Galeri Kegiatan

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin (upload); Publik & Anggota (lihat) |
| **Deskripsi** | Sistem menyediakan galeri foto dan video yang dapat dikaitkan dengan kegiatan tertentu. Pengunjung dapat melihat dokumentasi kegiatan organisasi. |
| **Alur Proses** | 1. Admin membuka menu Galeri. 2. Upload file (foto/video) beserta judul, deskripsi, dan kegiatan terkait. 3. File tersimpan di Supabase Storage. 4. Galeri tampil di halaman publik `/galeri` dengan filter berdasarkan kegiatan. |
| **Kriteria Penerimaan** | Tipe item dapat berupa FOTO atau VIDEO; dapat di-link ke `kegiatanId`; file tersimpan di storage; galeri publik menampilkan grid responsif. |

---

### F011 — Fitur Aspirasi (Kotak Saran)

| | |
|---|---|
| **Aktor / Role** | Pengunjung & Anggota (kirim); Admin (kelola) |
| **Deskripsi** | Sistem menyediakan kanal aspirasi/saran/keluhan untuk masyarakat dan anggota. Aspirasi memiliki status alur (PENDING → DIPROSES → SELESAI / DITOLAK) dan dapat dibalas oleh admin. |
| **Alur Proses** | 1. Pengguna mengisi form aspirasi: judul, pesan, kategori (nama opsional jika anonim). 2. Sistem menyimpan ke tabel `aspirasi` dengan status PENDING. 3. Admin meninjau di backoffice dan dapat membalas + mengubah status. 4. Anggota terdaftar dapat melihat riwayat aspirasi pribadinya. |
| **Kriteria Penerimaan** | Aspirasi anonim diperbolehkan; status alur berjalan; admin dapat memberi balasan; notifikasi terkirim ke anggota saat aspirasi dibalas. |

---

### F012 — Fitur E-Voting (Polling)

| | |
|---|---|
| **Aktor / Role** | Super Admin / Admin (buat polling); Anggota (vote) |
| **Deskripsi** | Sistem menyediakan e-voting internal untuk pemilihan pengurus, keputusan organisasi, atau survei opini. Setiap anggota hanya dapat memilih satu opsi per polling. Hasil ditampilkan secara real-time. |
| **Alur Proses** | 1. Admin membuat polling: judul, deskripsi, daftar opsi, tanggal kadaluwarsa. 2. Polling aktif tampil di member dashboard. 3. Anggota memilih opsi & submit. 4. Sistem mencegah double-vote (unique `userId + pollingId`). 5. Hasil divisualisasikan dalam grafik. |
| **Kriteria Penerimaan** | Satu anggota satu suara per polling; polling dengan `expiresAt` lewat tidak dapat di-vote; hasil real-time; hanya polling `isActive` yang tampil. |

---

### F013 — Fitur Notifikasi

| | |
|---|---|
| **Aktor / Role** | Sistem (kirim); Anggota & Admin (terima) |
| **Deskripsi** | Sistem mengirimkan notifikasi internal kepada pengguna untuk peristiwa penting (kegiatan baru, sertifikat terbit, balasan aspirasi, polling baru, pengingat iuran). |
| **Alur Proses** | 1. Sistem trigger notifikasi saat event tertentu terjadi. 2. Record disimpan di tabel `notifications` dengan field `userId`, `title`, `message`, `type`, `isRead`. 3. User membuka menu Notifikasi & menandai sebagai dibaca. |
| **Kriteria Penerimaan** | Notifikasi tampil real-time di header (badge counter); dapat ditandai sudah dibaca; notifikasi broadcast (`userId = null`) tampil ke semua user. |

---

### F014 — Fitur Survei SUS (System Usability Scale)

| | |
|---|---|
| **Aktor / Role** | Pengunjung & Anggota |
| **Deskripsi** | Sistem menyediakan survei SUS 10 pertanyaan untuk mengukur kebergunaan sistem. Skor SUS dihitung otomatis (0–100) dan dikategorikan (Excellent / Good / OK / Poor). Hasil agregat menjadi indikator UX. |
| **Alur Proses** | 1. Responden membuka halaman `/sus`. 2. Mengisi 10 pertanyaan skala 1–5. 3. Sistem menghitung skor: ((Σ ganjil − 5) + (25 − Σ genap)) × 2.5. 4. Sistem menentukan kategori berdasarkan skor. 5. Admin melihat rekap di backoffice (rata-rata skor, distribusi kategori). |
| **Kriteria Penerimaan** | Perhitungan skor SUS sesuai standar; kategori otomatis; admin dapat melihat agregat & detail per responden; ekspor data tersedia. |

---

### F015 — Fitur Kalender Kegiatan

| | |
|---|---|
| **Aktor / Role** | Anggota & Admin |
| **Deskripsi** | Sistem menampilkan seluruh kegiatan organisasi dalam tampilan kalender bulanan/mingguan. Anggota dapat melihat jadwal kegiatan mendatang dan mengkliknya untuk detail. |
| **Alur Proses** | 1. Pengguna membuka menu Kalender. 2. Sistem menampilkan kegiatan sesuai `tanggalMulai` & `tanggalSelesai`. 3. Klik event menampilkan detail kegiatan. 4. Filter berdasarkan jenis kegiatan tersedia. |
| **Kriteria Penerimaan** | Tampilan kalender responsif; event ditampilkan sesuai jenis (warna kategori); navigasi bulan/minggu berjalan; klik event mengarah ke detail. |

---

### F016 — Fitur Member Dashboard

| | |
|---|---|
| **Aktor / Role** | Anggota |
| **Deskripsi** | Halaman utama anggota yang menampilkan ringkasan: profil, jumlah kegiatan diikuti, jumlah sertifikat, status iuran, polling aktif, notifikasi belum dibaca. |
| **Alur Proses** | 1. Anggota login & diarahkan ke `/member/dashboard`. 2. Sistem mengambil data dari berbagai modul (anggota, kegiatan, sertifikat, iuran, polling, notifikasi). 3. Anggota dapat navigasi ke menu lain dari dashboard. |
| **Kriteria Penerimaan** | Data real-time dari database; widget hanya menampilkan data milik anggota login; tampilan responsif. |

---

### F017 — Fitur Dashboard Admin (Backoffice)

| | |
|---|---|
| **Aktor / Role** | Admin & Super Admin |
| **Deskripsi** | Halaman utama backoffice yang menampilkan statistik organisasi: total anggota aktif, kegiatan berlangsung, saldo kas, iuran bulan berjalan, aspirasi pending, dan grafik tren keuangan & keanggotaan. |
| **Alur Proses** | 1. Admin login & diarahkan ke `/dashboard`. 2. Sistem mengagregasi data dari seluruh modul. 3. Dashboard menampilkan kartu statistik & grafik (Recharts). 4. Quick action menuju modul-modul utama. |
| **Kriteria Penerimaan** | Statistik real-time; grafik responsif; data aspirasi pending hanya tampil bagi yang berwenang; tampilan menyesuaikan role. |

---

### F018 — Fitur Manajemen Admin (Super Admin Only)

| | |
|---|---|
| **Aktor / Role** | Super Admin Only |
| **Deskripsi** | Fitur eksklusif Super Admin untuk mengelola akun admin: menambah admin baru, mengubah jabatan/NIP, dan menonaktifkan admin. Admin baru dapat langsung login dengan role ADMIN. |
| **Alur Proses** | 1. Super Admin membuka menu Kelola Admin. 2. Menambah admin: input nama, email, password, NIP, jabatan, no. HP. 3. Sistem membuat record `User` (role ADMIN) dan `Admin`. 4. Super Admin dapat mengedit atau menonaktifkan admin existing. |
| **Kriteria Penerimaan** | Hanya Super Admin yang dapat akses (middleware); email & NIP admin unik; password ter-hash; admin yang dinonaktifkan tidak dapat login. |

---

### F019 — Fitur Audit Log (Super Admin Only)

| | |
|---|---|
| **Aktor / Role** | Super Admin |
| **Deskripsi** | Sistem mencatat seluruh aktivitas penting (CREATE, UPDATE, DELETE, LOGIN) yang dilakukan oleh admin & super admin sebagai jejak audit. Setiap log memuat `userId`, `userName`, `action`, `module`, `targetId`, `detail`, dan `ipAddress`. |
| **Alur Proses** | 1. Sistem otomatis mencatat log saat aksi penting terjadi. 2. Super Admin membuka menu Log. 3. Sistem menampilkan log dengan filter berdasarkan modul, user, dan rentang tanggal. 4. Detail log dapat ditinjau untuk audit kepatuhan. |
| **Kriteria Penerimaan** | Log tersimpan di tabel `audit_logs`; filter & pencarian berjalan; log tidak dapat dihapus oleh siapapun (immutable); ekspor log tersedia. |

---

### F020 — Fitur Profil Anggota

| | |
|---|---|
| **Aktor / Role** | Anggota |
| **Deskripsi** | Anggota dapat melihat dan mengupdate data profil pribadinya, termasuk foto, alamat, no. HP, pekerjaan, dan pendidikan. |
| **Alur Proses** | 1. Anggota membuka menu Profil. 2. Sistem menampilkan data dari tabel `anggota` & `users`. 3. Anggota mengubah data yang diperbolehkan & menyimpan. 4. Foto baru di-upload ke Supabase Storage. |
| **Kriteria Penerimaan** | NIK & email tidak dapat diubah oleh anggota; foto profil tersimpan; perubahan tercatat di `updatedAt`. |

---

### F021 — Fitur Halaman Publik (Landing & Profil Organisasi)

| | |
|---|---|
| **Aktor / Role** | Pengunjung |
| **Deskripsi** | Halaman publik yang dapat diakses tanpa login: landing page dengan profil organisasi, halaman tentang, daftar program kerja, berita & artikel terbaru, galeri kegiatan, dan tautan ke fitur publik lainnya (aspirasi, SUS). |
| **Alur Proses** | 1. Pengunjung membuka domain utama. 2. Landing page menampilkan hero, ringkasan organisasi, program unggulan, berita terbaru, dan galeri. 3. Pengunjung dapat navigasi ke halaman tentang, program, berita, artikel, galeri, kegiatan, aspirasi, dan SUS. |
| **Kriteria Penerimaan** | Halaman publik dapat diakses tanpa autentikasi; SEO-friendly; responsif (mobile-first); konten dimuat dari database (CMS). |

---

## RINGKASAN KEBUTUHAN FUNGSIONAL

| Kode | Nama Fitur | Aktor Utama |
|---|---|---|
| F001 | Autentikasi (Login & Logout) | Semua role terdaftar |
| F002 | Registrasi Anggota | Pengunjung |
| F003 | Manajemen Anggota | Admin / Super Admin |
| F004 | Manajemen Kegiatan | Admin / Super Admin |
| F005 | Absensi Kegiatan | Admin / Super Admin |
| F006 | Penerbitan Sertifikat dengan QR Code | Admin / Super Admin |
| F007 | Manajemen Iuran Anggota | Admin / Anggota |
| F008 | Manajemen Keuangan Organisasi | Admin / Super Admin |
| F009 | CMS Berita & Artikel | Admin / Publik |
| F010 | Galeri Kegiatan | Admin / Publik |
| F011 | Aspirasi (Kotak Saran) | Publik / Admin |
| F012 | E-Voting (Polling) | Anggota / Admin |
| F013 | Notifikasi | Sistem / Semua user |
| F014 | Survei SUS | Publik / Admin |
| F015 | Kalender Kegiatan | Anggota / Admin |
| F016 | Member Dashboard | Anggota |
| F017 | Dashboard Admin | Admin / Super Admin |
| F018 | Manajemen Admin | Super Admin Only |
| F019 | Audit Log | Super Admin Only |
| F020 | Profil Anggota | Anggota |
| F021 | Halaman Publik | Pengunjung |
