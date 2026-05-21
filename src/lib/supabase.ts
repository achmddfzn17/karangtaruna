import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients with **lazy** initialization.
 *
 * Why lazy?
 * ---------
 * Next.js evaluates every imported module during `next build` ("Collecting page
 * data"). On Vercel, env-vars like NEXT_PUBLIC_SUPABASE_URL may not be present
 * at build time. Calling `createClient()` at module top-level would crash the
 * build. The getters below defer construction until the first actual use, which
 * always happens at request-time where the env-vars are available.
 */

export const STORAGE_BUCKET = "galeri";

// ---------------------------------------------------------------------------
// Lazy singletons
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL is not set. " +
      "Please check your environment configuration."
    );
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
      "Please check your environment configuration."
    );
  }
  return key;
}

/** Client using anon key — enough for uploads to public buckets */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabase;
}

/** Admin client using service role key (falls back to anon key) */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = getSupabaseUrl();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const key =
      serviceKey && serviceKey !== "your-service-role-key-here"
        ? serviceKey
        : getSupabaseAnonKey();
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Backward-compatible exports (lazy via getter)
// These look like plain variables but initialize on first access.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/**
 * Generate public URL dari path file di Supabase Storage
 */
export function getPublicUrl(path: string): string {
  const { data } = getSupabaseAdmin().storage
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn("[EXTRACT_PATH] NEXT_PUBLIC_SUPABASE_URL not set");
      return null;
    }
    const expectedDomain = new URL(supabaseUrl).hostname;
    if (urlObj.hostname !== expectedDomain) {
      console.warn("[EXTRACT_PATH] Domain mismatch:", urlObj.hostname, "expected:", expectedDomain);
      return null;
    }
    
    // Pattern: /storage/v1/object/public/{bucket}/{path}
    const match = urlObj.pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match && match[1] === STORAGE_BUCKET && match[2]) {
      const filePath = decodeURIComponent(match[2]);
      
      // Security: Prevent path traversal
      if (filePath.includes("..") || filePath.startsWith("/")) {
        console.warn("[EXTRACT_PATH] Path traversal attempt detected:", filePath);
        return null;
      }
      
      return filePath;
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
    
    const { error } = await getSupabaseAdmin().storage
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
    const { error } = await getSupabaseAdmin().storage
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

