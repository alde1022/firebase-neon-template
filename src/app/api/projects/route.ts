import { NextRequest } from 'next/server';
import { withAuth, withOptionalAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/drizzle/schema';
import { eq, desc, and, or } from 'drizzle-orm';

/**
 * GET /api/projects
 * List user's projects (or public projects if unauthenticated)
 */
export const GET = withOptionalAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let whereClause;
  
  if (ctx) {
    // Authenticated: show user's projects + public projects
    whereClause = or(
      eq(projects.userId, ctx.dbUser.id),
      eq(projects.isPublic, true)
    );
  } else {
    // Unauthenticated: only public projects
    whereClause = eq(projects.isPublic, true);
  }

  const results = await db
    .select()
    .from(projects)
    .where(whereClause)
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);

  return Response.json({ projects: results });
});

/**
 * POST /api/projects
 * Create a new project
 */
export const POST = withAuth(async (req, { user, dbUser }) => {
  const body = await req.json();
  const { name, description, isPublic = false } = body;

  // Validate
  if (!name || typeof name !== 'string' || name.length < 1) {
    return Response.json({ error: 'Name is required' }, { status: 400 });
  }

  // Create project
  const [project] = await db
    .insert(projects)
    .values({
      userId: dbUser.id,
      name: name.trim(),
      description: description?.trim() || null,
      isPublic,
    })
    .returning();

  return Response.json({ project }, { status: 201 });
});
