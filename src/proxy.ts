import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const isLoggedIn = !!session;
  const { nextUrl } = request;

  const isAdminRoute = nextUrl.pathname.startsWith("/dashboard");

  const isMemberRoute = nextUrl.pathname.startsWith("/member");

  const isAuthRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname.startsWith("/anggota/login");

  const userRole = (session?.user as any)?.role;

  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    } else if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }
  }

  if (isMemberRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/anggota/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$|.*\\.gif$|.*\\.ico$).*)"],
};
