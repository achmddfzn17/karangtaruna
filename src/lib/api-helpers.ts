/**
 * API Helper Utilities
 * Standardized request validation and response formatting
 */

import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standardized API Response Format
 */
export const ApiResponse = {
  success: <T>(data: T, status: number = 200) => {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  },

  error: (message: string, status: number = 400, details?: unknown) => {
    const response: { success: false; error: string; details?: unknown } = {
      success: false,
      error: message,
    };
    
    if (details) {
      response.details = details;
    }
    
    return NextResponse.json(response, { status });
  },

  unauthorized: (message: string = "Unauthorized") => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  },

  forbidden: (message: string = "Forbidden") => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 403 }
    );
  },

  notFound: (message: string = "Not found") => {
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  },

  serverError: (message: string = "Internal server error", error?: unknown) => {
    console.error("[SERVER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  },
};

/**
 * Validate request body with Zod schema
 * @param req - Request object
 * @param schema - Zod schema
 * @returns Parsed and validated data
 * @throws Error if validation fails
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError.message);
    }
    throw new Error("Invalid request body");
  }
}

/**
 * Validate query parameters with Zod schema
 * @param url - URL object
 * @param schema - Zod schema
 * @returns Parsed and validated data
 * @throws Error if validation fails
 */
export function validateQuery<T>(
  url: URL,
  schema: z.ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError.message);
    }
    throw new Error("Invalid query parameters");
  }
}

/**
 * Safe async handler with automatic error responses
 * @param handler - Async function to execute
 * @returns NextResponse
 */
export function apiHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error("[API_HANDLER_ERROR]", error);
    
    if (error instanceof Error) {
      return ApiResponse.error(error.message);
    }
    
    return ApiResponse.serverError();
  });
}

/**
 * Extract user ID from session safely
 * @param session - Auth session
 * @returns User ID or null
 */
export function getUserId(session: { user?: { id?: string } } | null): string | null {
  return session?.user?.id || null;
}

/**
 * Extract user role from session safely
 * @param session - Auth session
 * @returns User role or null
 */
export function getUserRole(session: { user?: { role?: string } } | null): string | null {
  return session?.user?.role || null;
}

/**
 * Check if user has required role
 * @param session - Auth session
 * @param allowedRoles - Array of allowed roles
 * @returns boolean
 */
export function hasRole(session: { user?: { role?: string } } | null, allowedRoles: string[]): boolean {
  const role = getUserRole(session);
  return role ? allowedRoles.includes(role) : false;
}
