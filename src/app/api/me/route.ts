import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, projects } from '@/drizzle/schema';
import { eq, count } from 'drizzle-orm';

/**
 * GET /api/me
 * Get current user's profile with stats
 */
export const GET = withAuth(async (req, { user, dbUser }) => {
  // Get project count
  const [stats] = await db
    .select({ projectCount: count() })
    .from(projects)
    .where(eq(projects.userId, dbUser.id));

  return Response.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
      tier: dbUser.tier,
      createdAt: dbUser.createdAt,
    },
    stats: {
      projectCount: stats?.projectCount || 0,
    },
  });
});

/**
 * PATCH /api/me
 * Update current user's profile
 */
export const PATCH = withAuth(async (req, { user, dbUser }) => {
  const body = await req.json();
  const { name, avatarUrl } = body;

  // Validate input
  if (name !== undefined && typeof name !== 'string') {
    return Response.json({ error: 'Invalid name' }, { status: 400 });
  }

  // Update user
  const [updated] = await db
    .update(users)
    .set({
      ...(name !== undefined && { name }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, dbUser.id))
    .returning();

  return Response.json({ user: updated });
});

/**
 * DELETE /api/me
 * Delete current user's account
 */
export const DELETE = withAuth(async (req, { user, dbUser }) => {
  // Delete user (cascades to related records via FK)
  await db.delete(users).where(eq(users.id, dbUser.id));

  return Response.json({ success: true });
});
