/**
 * safeQuery
 *
 * Pembungkus query database supaya halaman publik tidak crash total ketika
 * database sedang tidak bisa dihubungi (misalnya project Supabase paused atau
 * jaringan bermasalah). Kalau query gagal, error dicatat ke console lalu nilai
 * fallback dikembalikan sehingga halaman tetap bisa dirender dengan state kosong.
 *
 * Ini hanya jaring pengaman di sisi tampilan. Data tetap tidak akan muncul
 * selama koneksi database belum diperbaiki di sisi Supabase.
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  label = "safeQuery",
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error(`[${label}] Gagal mengambil data dari database:`, error);
    return fallback;
  }
}
