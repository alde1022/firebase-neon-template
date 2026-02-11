# Firebase Auth + Neon Template

A production-ready template for Next.js apps using Firebase Authentication and Neon (Postgres) database.

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Auth:** Firebase Authentication
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle (or Prisma - your choice)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (frontend) + any backend

## Quick Start

```bash
# Clone and install
npx create-next-app@latest my-app --typescript
cd my-app

# Install dependencies
npm install firebase firebase-admin
npm install @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit

# Copy the template files into your project
# Set up environment variables (see .env.example)
```

## Environment Variables

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin (Server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Neon Database
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  Firebase SDK → Auth State → Protected Routes               │
└─────────────────────┬───────────────────────────────────────┘
                      │ ID Token (header)
┌─────────────────────▼───────────────────────────────────────┐
│                    API Routes                               │
│  Verify Token → Get/Create User → Business Logic            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Neon Database                             │
│  users, projects, etc.                                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

- `src/lib/firebase-client.ts` - Client-side Firebase setup
- `src/lib/firebase-admin.ts` - Server-side Firebase Admin
- `src/lib/db.ts` - Neon database connection
- `src/lib/auth.ts` - Auth utilities (verify token, get user)
- `src/app/api/auth/[...path]/route.ts` - Auth API routes
- `drizzle/schema.ts` - Database schema

## Usage

### Client-side Auth

```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <button onClick={signIn}>Sign In</button>;
  
  return <div>Hello, {user.email}</div>;
}
```

### Protected API Routes

```ts
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (req, { user, dbUser }) => {
  // user = Firebase user from token
  // dbUser = User record from Neon
  return Response.json({ projects: await getProjects(dbUser.id) });
});
```

### Database Queries

```ts
import { db } from '@/lib/db';
import { users, projects } from '@/drizzle/schema';

const userProjects = await db
  .select()
  .from(projects)
  .where(eq(projects.userId, userId));
```
