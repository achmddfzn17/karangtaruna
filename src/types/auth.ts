/**
 * Authentication type definitions
 * Extends NextAuth types for type safety
 */

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'ANGGOTA';
  image?: string | null;
}

export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}
