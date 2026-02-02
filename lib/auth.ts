import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Temporary: hardcoded hash for admin123 until we fix env variable loading
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$iiU4vnnf70KXVwviMvTDi.U4tLjaIGmRzzFNAp2dUAWvvZQM44EeG';
const SESSION_COOKIE_NAME = 'bbm_admin_session';
const SESSION_SECRET = 'bbm-shiurim-admin-secret'; // In production, use a proper secret
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  authenticated: boolean;
  expiresAt: number;
}

/**
 * Verify admin password
 * @param password - Plain text password to verify
 * @returns True if password is correct
 */
export async function verifyPassword(password: string): Promise<boolean> {
  // Simple password check - change "admin123" to whatever password you want
  return password === 'admin123';
}

/**
 * Create an admin session
 * @returns Session token
 */
export async function createSession(): Promise<string> {
  const sessionData: SessionData = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION,
  };

  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  
  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });

  return sessionToken;
}

/**
 * Verify if current session is valid
 * @returns True if session is valid
 */
export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) return false;

    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString('utf-8')
    );

    if (!sessionData.authenticated) return false;
    if (Date.now() > sessionData.expiresAt) {
      // Session expired, clear it
      await clearSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying session:', error);
    return false;
  }
}

/**
 * Clear the admin session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Middleware helper to protect API routes
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
}
