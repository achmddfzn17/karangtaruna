// ===== ENUMS =====
export type Role = "SUPER_ADMIN" | "ADMIN" | "ANGGOTA";
export type JenisKelamin = "LAKI_LAKI" | "PEREMPUAN";
export type StatusAnggota = "AKTIF" | "NON_AKTIF" | "ALUMNI";
export type JenisKegiatan =
  | "SOSIAL"
  | "PENDIDIKAN"
  | "EKONOMI"
  | "OLAHRAGA"
  | "SENI_BUDAYA"
  | "LAINNYA";
export type StatusKegiatan = "UPCOMING" | "ONGOING" | "SELESAI" | "DIBATALKAN";
export type StatusPublish = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type JenisTransaksi = "MASUK" | "KELUAR";
export type GaleriType = "FOTO" | "VIDEO";

// ===== USER =====
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ANGGOTA =====
export interface Anggota {
  id: string;
  userId?: string | null;
  namaLengkap: string;
  nik: string;
  tempatLahir?: string | null;
  tanggalLahir?: Date | null;
  jenisKelamin: JenisKelamin;
  alamat?: string | null;
  noHp?: string | null;
  email?: string | null;
  foto?: string | null;
  pekerjaan?: string | null;
  pendidikan?: string | null;
  status: StatusAnggota;
  tanggalGabung: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnggotaFormData {
  namaLengkap: string;
  nik: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin: JenisKelamin;
  alamat?: string;
  noHp?: string;
  email?: string;
  pekerjaan?: string;
  pendidikan?: string;
  status: StatusAnggota;
}

// ===== KEGIATAN =====
export interface Kegiatan {
  id: string;
  nama: string;
  deskripsi?: string | null;
  jenis: JenisKegiatan;
  tanggalMulai: Date;
  tanggalSelesai?: Date | null;
  lokasi?: string | null;
  anggaran?: number | null;
  thumbnail?: string | null;
  status: StatusKegiatan;
  _count?: { peserta: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface KegiatanFormData {
  nama: string;
  deskripsi?: string;
  jenis: JenisKegiatan;
  tanggalMulai: string;
  tanggalSelesai?: string;
  lokasi?: string;
  anggaran?: number;
  status: StatusKegiatan;
}

// ===== PROGRAM =====
export interface Program {
  id: string;
  nama: string;
  deskripsi?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  status: boolean;
  urutan: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BERITA =====
export interface Berita {
  id: string;
  judul: string;
  slug: string;
  isi: string;
  ringkasan?: string | null;
  thumbnail?: string | null;
  tags: string[];
  kategori?: string | null;
  status: StatusPublish;
  publishedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ARTIKEL =====
export interface Artikel {
  id: string;
  judul: string;
  slug: string;
  isi: string;
  ringkasan?: string | null;
  thumbnail?: string | null;
  tags: string[];
  kategori?: string | null;
  status: StatusPublish;
  publishedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== GALERI =====
export interface GaleriItem {
  id: string;
  judul: string;
  deskripsi?: string | null;
  url: string;
  type: GaleriType;
  kegiatanId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== KEUANGAN =====
export interface KategoriTransaksi {
  id: string;
  nama: string;
  jenis: JenisTransaksi;
  keterangan?: string | null;
  createdAt: Date;
}

export interface TransaksiKeuangan {
  id: string;
  tanggal: Date;
  keterangan: string;
  jumlah: number;
  jenis: JenisTransaksi;
  kategoriId?: string | null;
  kategori?: KategoriTransaksi | null;
  bukti?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeuanganFormData {
  tanggal: string;
  keterangan: string;
  jumlah: number;
  jenis: JenisTransaksi;
  kategoriId?: string;
}

// ===== SUS =====
export interface SusResponse {
  id: string;
  userId?: string | null;
  responden?: string | null;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  score: number;
  kategori: string;
  createdAt: Date;
}

// ===== STATS =====
export interface DashboardStats {
  totalAnggota: number;
  anggotaAktif: number;
  totalKegiatan: number;
  totalProgram: number;
  totalBerita: number;
  totalArtikel: number;
  kasmasuk: number;
  kasKeluar: number;
  saldo: number;
}

// ===== API RESPONSE =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== TABLE =====
export interface TableFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

// ===== NAVIGATION =====
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

// ===== NOTIFICATION =====
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  userId?: string | null;
  createdAt: Date;
}
