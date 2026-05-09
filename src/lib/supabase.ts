import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client pakai anon key — cukup untuk upload ke public bucket
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin pakai service role jika tersedia, fallback ke anon key
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey && supabaseServiceKey !== "your-service-role-key-here"
    ? supabaseServiceKey
    : supabaseAnonKey
);

export const STORAGE_BUCKET = "galeri";

/**
 * Generate public URL dari path file di Supabase Storage
 */
export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract file path dari Supabase public URL
 * Contoh: https://xxx.supabase.co/storage/v1/object/public/galeri/foto.jpg -> foto.jpg
 */
export function extractPathFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  
  // Security: Validate URL format
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.warn("[EXTRACT_PATH] Invalid URL protocol:", url);
    return null;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Security: Validate domain matches Supabase URL
    const expectedDomain = new URL(supabaseUrl).hostname;
    if (urlObj.hostname !== expectedDomain) {
      console.warn("[EXTRACT_PATH] Domain mismatch:", urlObj.hostname, "expected:", expectedDomain);
      return null;
    }
    
    // Pattern: /storage/v1/object/public/{bucket}/{path}
    const match = urlObj.pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match && match[1] === STORAGE_BUCKET && match[2]) {
      const path = decodeURIComponent(match[2]);
      
      // Security: Prevent path traversal
      if (path.includes("..") || path.startsWith("/")) {
        console.warn("[EXTRACT_PATH] Path traversal attempt detected:", path);
        return null;
      }
      
      return path;
    }
    
    return null;
  } catch (error) {
    console.error("[EXTRACT_PATH_ERROR]", error);
    return null;
  }
}

/**
 * Hapus file dari Supabase Storage
 * @param url - Public URL atau path file
 * @returns true jika berhasil, false jika gagal
 */
export async function deleteFileFromStorage(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const path = extractPathFromUrl(url);
    if (!path) {
      console.warn("[DELETE_FILE] Cannot extract path from URL:", url);
      return false;
    }
    
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
    
    if (error) {
      console.error("[DELETE_FILE_ERROR]", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[DELETE_FILE_EXCEPTION]", error);
    return false;
  }
}

/**
 * Hapus multiple files dari Supabase Storage
 * @param urls - Array of public URLs atau paths
 * @returns Jumlah file yang berhasil dihapus
 */
export async function deleteFilesFromStorage(urls: string[]): Promise<number> {
  if (!urls || urls.length === 0) return 0;
  
  const paths = urls
    .map(url => extractPathFromUrl(url))
    .filter((path): path is string => path !== null);
  
  if (paths.length === 0) return 0;
  
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(paths);
    
    if (error) {
      console.error("[DELETE_FILES_ERROR]", error);
      return 0;
    }
    
    return paths.length;
  } catch (error) {
    console.error("[DELETE_FILES_EXCEPTION]", error);
    return 0;
  }
}
