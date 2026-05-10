import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

/**
 * Server-side auth helpers untuk page-level protection
 * Digunakan di server components untuk validate session
 */

/**
 * Require authentication - redirect to login if not authenticated
 * @param redirectTo - Optional redirect URL after login
 */
export async function requireAuth(redirectTo?: string) {
  const session = await auth();
  
  if (!session?.user) {
    const loginUrl = redirectTo 
      ? `/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginUrl);
  }
  
  return session;
}

/**
 * Require member authentication - redirect to member login if not authenticated
 * @param redirectTo - Optional redirect URL after login
 */
export async function requireMemberAuth(redirectTo?: string) {
  const session = await auth();
  
  if (!session?.user) {
    const loginUrl = redirectTo 
      ? `/anggota/login?callbackUrl=${encodeURIComponent(redirectTo)}`
      : "/anggota/login";
    redirect(loginUrl);
  }
  
  return session;
}

/**
 * Require admin role - redirect if not admin
 * @param allowedRoles - Array of allowed roles (default: ADMIN, SUPER_ADMIN)
 */
export async function requireAdmin(allowedRoles: Role[] = ["ADMIN", "SUPER_ADMIN"]) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    // Non-admin users redirect to member area
    redirect("/member");
  }
  
  return session;
}

/**
 * Require super admin role - redirect if not super admin
 */
export async function requireSuperAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (session.user.role !== "SUPER_ADMIN") {
    // Non-super-admin redirect to dashboard
    redirect("/dashboard");
  }
  
  return session;
}

/**
 * Get current session (optional - doesn't redirect)
 * @returns Session or null
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(session.user.role);
  }
  
  return session.user.role === role;
}
