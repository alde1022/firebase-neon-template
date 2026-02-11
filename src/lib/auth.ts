import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, DecodedIdToken } from './firebase-admin';
import { db } from './db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export interface DbUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  user: DecodedIdToken;   // Firebase user from token
  dbUser: DbUser;          // User record from database
}

type AuthHandler = (
  req: NextRequest,
  ctx: AuthContext
) => Promise<Response>;

/**
 * Extract token from Authorization header
 */
function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Get or create user in database from Firebase token
 */
async function getOrCreateUser(firebaseUser: DecodedIdToken): Promise<DbUser> {
  // Try to find existing user
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUser.uid))
    .limit(1);

  if (existing) {
    return existing as DbUser;
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.name || null,
      avatarUrl: firebaseUser.picture || null,
    })
    .returning();

  return newUser as DbUser;
}

/**
 * Higher-order function to protect API routes
 * 
 * Usage:
 * export const GET = withAuth(async (req, { user, dbUser }) => {
 *   return Response.json({ data: 'protected' });
 * });
 */
export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest): Promise<Response> => {
    // Extract token
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    // Verify token
    const firebaseUser = await verifyIdToken(token);
    if (!firebaseUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get or create database user
    const dbUser = await getOrCreateUser(firebaseUser);

    // Call the handler with auth context
    return handler(req, { user: firebaseUser, dbUser });
  };
}

/**
 * Optional auth - doesn't fail if no token, but provides user if present
 */
export function withOptionalAuth(
  handler: (req: NextRequest, ctx: AuthContext | null) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const token = extractToken(req);
    
    if (!token) {
      return handler(req, null);
    }

    const firebaseUser = await verifyIdToken(token);
    if (!firebaseUser) {
      return handler(req, null);
    }

    const dbUser = await getOrCreateUser(firebaseUser);
    return handler(req, { user: firebaseUser, dbUser });
  };
}

/**
 * Verify token and get user (for use outside route handlers)
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthContext | null> {
  const token = extractToken(req);
  if (!token) return null;

  const firebaseUser = await verifyIdToken(token);
  if (!firebaseUser) return null;

  const dbUser = await getOrCreateUser(firebaseUser);
  return { user: firebaseUser, dbUser };
}
