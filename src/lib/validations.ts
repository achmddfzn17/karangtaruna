import { z } from "zod";

/**
 * Reusable Zod validation schemas
 * Centralized validation untuk consistency across the app
 */

// ===== COMMON SCHEMAS =====

export const nikSchema = z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka");

export const phoneSchema = z.string().regex(
  /^(\+62|0)[0-9]{9,12}$/,
  "Format nomor HP tidak valid (contoh: 081234567890)"
);

export const emailSchema = z.string().email("Format email tidak valid");

export const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .max(100, "Password maksimal 100 karakter");

export const urlSchema = z.string().url("Format URL tidak valid");

export const slugSchema = z.string()
  .min(3, "Slug minimal 3 karakter")
  .max(200, "Slug maksimal 200 karakter")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan dash");

// ===== ANGGOTA SCHEMAS =====

export const updateAnggotaSchema = z.object({
  namaLengkap: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  nik: nikSchema,
  tempatLahir: z.string().max(100).trim().optional().or(z.literal("")),
  tanggalLahir: z.string().optional().or(z.literal("")),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"], { required_error: "Jenis kelamin wajib dipilih" }),
  alamat: z.string().max(500, "Alamat maksimal 500 karakter").optional().or(z.literal("")),
  noHp: phoneSchema.optional().or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  pekerjaan: z.string().max(100).optional().or(z.literal("")),
  pendidikan: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(["AKTIF", "NON_AKTIF", "ALUMNI"]),
  foto: urlSchema.optional().or(z.literal("")),
});

export const buatAkunSchema = z.object({
  loginEmail: emailSchema,
  loginPassword: passwordSchema,
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

// ===== BERITA & ARTIKEL SCHEMAS =====

export const createBeritaSchema = z.object({
  judul: z.string().min(10, "Judul minimal 10 karakter").max(200, "Judul maksimal 200 karakter").trim(),
  isi: z.string().min(50, "Isi minimal 50 karakter").max(50000, "Isi maksimal 50.000 karakter"),
  ringkasan: z.string().max(500, "Ringkasan maksimal 500 karakter").optional().or(z.literal("")),
  kategori: z.string().max(50).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")), // Comma-separated
  thumbnail: urlSchema.optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const updateBeritaSchema = createBeritaSchema;
export const createArtikelSchema = createBeritaSchema;
export const updateArtikelSchema = createBeritaSchema;

// ===== KEGIATAN SCHEMAS =====

export const createKegiatanSchema = z.object({
  nama: z.string().min(5, "Nama kegiatan minimal 5 karakter").max(200, "Nama maksimal 200 karakter").trim(),
  deskripsi: z.string().max(5000, "Deskripsi maksimal 5000 karakter").optional().or(z.literal("")),
  jenis: z.enum(["SOSIAL", "PENDIDIKAN", "EKONOMI", "OLAHRAGA", "SENI_BUDAYA", "LAINNYA"]),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().optional().or(z.literal("")),
  lokasi: z.string().max(200).optional().or(z.literal("")),
  anggaran: z.string().optional().or(z.literal("")),
  status: z.enum(["UPCOMING", "ONGOING", "SELESAI", "DIBATALKAN"]),
  thumbnail: urlSchema.optional().or(z.literal("")),
}).refine((data) => {
  // Validate date range
  if (data.tanggalSelesai && data.tanggalMulai) {
    const mulai = new Date(data.tanggalMulai);
    const selesai = new Date(data.tanggalSelesai);
    return selesai >= mulai;
  }
  return true;
}, {
  message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
  path: ["tanggalSelesai"],
});

export const updateKegiatanSchema = createKegiatanSchema;

// ===== KEUANGAN SCHEMAS =====

export const createTransaksiSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  keterangan: z.string().min(3, "Keterangan minimal 3 karakter").max(500, "Keterangan maksimal 500 karakter").trim(),
  jumlah: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 999_999_999;
  }, "Jumlah harus antara 0 dan 999.999.999"),
  jenis: z.enum(["MASUK", "KELUAR"]),
  kategoriId: z.string().optional().or(z.literal("")),
  bukti: urlSchema.optional().or(z.literal("")),
});

export const updateTransaksiSchema = createTransaksiSchema;

export const createKategoriSchema = z.object({
  nama: z.string().min(3, "Nama kategori minimal 3 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  jenis: z.enum(["MASUK", "KELUAR"]),
  keterangan: z.string().max(500).optional().or(z.literal("")),
});

// ===== IURAN SCHEMAS =====

export const updateIuranSchema = z.object({
  jumlah: z.number().positive("Jumlah harus lebih dari 0").max(999_999_999, "Jumlah terlalu besar"),
  tanggalBayar: z.string().optional(),
  keterangan: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
});

// ===== VOTING SCHEMAS =====

export const createPollingSchema = z.object({
  judul: z.string()
    .min(5, "Judul minimal 5 karakter")
    .max(200, "Judul maksimal 200 karakter")
    .trim(),
  deskripsi: z.string().max(1000, "Deskripsi maksimal 1000 karakter").optional(),
  options: z.string()
    .min(1, "Pilihan tidak boleh kosong")
    .transform((val) =>
      val
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o !== "")
    )
    .refine((arr) => arr.length >= 2, "Minimal 2 pilihan diperlukan")
    .refine((arr) => arr.length <= 10, "Maksimal 10 pilihan")
    .refine((arr) => new Set(arr).size === arr.length, "Pilihan tidak boleh duplikat"),
  expiresAt: z.string()
    .optional()
    .transform((val) => (val ? new Date(val) : null))
    .refine(
      (date) => !date || date > new Date(),
      "Tanggal kadaluarsa harus di masa depan"
    ),
});

// ===== ASPIRASI SCHEMAS =====

export const createAspirasiSchema = z.object({
  nama: z.string().max(100).optional().or(z.literal("")),
  judul: z.string().min(5, "Judul minimal 5 karakter").max(200, "Judul maksimal 200 karakter").trim(),
  pesan: z.string().min(10, "Pesan minimal 10 karakter").max(5000, "Pesan maksimal 5000 karakter").trim(),
  kategori: z.string().max(50).optional().or(z.literal("")),
});

export const replyAspirasiSchema = z.object({
  balasan: z.string().min(10, "Balasan minimal 10 karakter").max(5000, "Balasan maksimal 5000 karakter").trim(),
  status: z.enum(["PENDING", "DIPROSES", "SELESAI", "DITOLAK"]),
});

// ===== PROGRAM SCHEMAS =====

export const createProgramSchema = z.object({
  nama: z.string().min(3, "Nama program minimal 3 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  deskripsi: z.string().max(5000, "Deskripsi maksimal 5000 karakter").optional().or(z.literal("")),
  thumbnail: urlSchema.optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  status: z.boolean(),
  urutan: z.number().int().min(0).max(999),
});

export const updateProgramSchema = createProgramSchema;

// ===== ADMIN SCHEMAS =====

export const createAdminSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  nip: z.string().max(50).optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
  jabatan: z.string().max(100).optional().or(z.literal("")),
});

export const updateAdminSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  email: emailSchema,
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  nip: z.string().max(50).optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
  jabatan: z.string().max(100).optional().or(z.literal("")),
});

// ===== SUS SCHEMAS =====

export const susResponseSchema = z.object({
  responden: z.string().min(1, "Nama wajib diisi").max(100).trim(),
  q1: z.number().min(1).max(5),
  q2: z.number().min(1).max(5),
  q3: z.number().min(1).max(5),
  q4: z.number().min(1).max(5),
  q5: z.number().min(1).max(5),
  q6: z.number().min(1).max(5),
  q7: z.number().min(1).max(5),
  q8: z.number().min(1).max(5),
  q9: z.number().min(1).max(5),
  q10: z.number().min(1).max(5),
});

// ===== HELPER FUNCTIONS =====

/**
 * Parse FormData to object with proper type conversion
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  
  for (const [key, value] of formData.entries()) {
    // Convert string numbers to actual numbers
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      obj[key] = Number(value);
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

/**
 * Validate and parse FormData with a Zod schema
 * Returns parsed data or throws error with user-friendly message
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): T {
  const rawData: Record<string, unknown> = {};
  
  for (const [key, value] of formData.entries()) {
    rawData[key] = value;
  }
  
  const validation = schema.safeParse(rawData);
  
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError.message);
  }
  
  return validation.data;
}
