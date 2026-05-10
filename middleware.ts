import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware untuk route protection
 * 
 * IMPORTANT: NextAuth v5 middleware has Edge Runtime compatibility issues
 * with bcrypt and Prisma. Using custom middleware with page-level auth instead.
 * 
 * Auth checks are performed at:
 * - Page level: Each protected page checks session
 * - API level: Each API route validates auth
 * 
 * This approach is more reliable and avoids Edge Runtime crypto module issues.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow all
  const publicPaths = [
    "/",
    "/login",
    "/anggota/login",
    "/sus",
    "/berita",
    "/artikel",
    "/galeri",
    "/program",
    "/tentang",
    "/kontak",
    "/api/auth",
    "/api/sus",
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected routes, let page-level auth handle it
  // This avoids Edge Runtime issues with NextAuth
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Runs middleware on all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
