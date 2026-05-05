import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAdminRoute = nextUrl.pathname.startsWith("/dashboard");
  const isMemberRoute = nextUrl.pathname.startsWith("/member");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname.startsWith("/anggota/login");

  const userRole = (req.auth?.user as any)?.role;

  // 1. Block logged in users from auth pages
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }
  }

  // 2. Protect Admin Routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    } else if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      // Members trying to access admin dashboard -> redirect to member dashboard
      return NextResponse.redirect(new URL("/member/dashboard", nextUrl));
    }
  }

  // 3. Protect Member Routes
  if (isMemberRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/anggota/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$|.*\\.gif$|.*\\.ico$).*)"],
};
