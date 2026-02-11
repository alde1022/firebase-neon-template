# Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project (or use existing)
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (optional)
   - Enable GitHub (optional - requires GitHub OAuth app)
4. Get client config:
   - Project Settings > Your apps > Add Web app
   - Copy the config values to `.env`
5. Get admin credentials:
   - Project Settings > Service accounts
   - Generate new private key
   - Extract `project_id`, `client_email`, `private_key` to `.env`

## 2. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create new project
3. Copy connection string to `.env` as `DATABASE_URL`
4. Use the pooled connection for serverless

## 3. Run Migrations

```bash
# Generate migration from schema
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

## 4. Configure Auth Domain

In Firebase Console > Authentication > Settings > Authorized domains:
- Add your production domain
- Add localhost for development

## 5. Test Locally

```bash
npm run dev
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── me/route.ts          # User profile endpoints
│   │   └── projects/route.ts    # Example CRUD endpoints
│   └── layout.tsx               # Wrap with AuthProvider
├── hooks/
│   └── useAuth.ts               # React hook for auth
├── lib/
│   ├── firebase-client.ts       # Client-side Firebase
│   ├── firebase-admin.ts        # Server-side Firebase Admin
│   ├── db.ts                    # Neon/Drizzle connection
│   ├── auth.ts                  # withAuth middleware
│   └── api.ts                   # Fetch wrapper with auth
└── providers/
    └── AuthProvider.tsx         # React context provider
drizzle/
├── schema.ts                    # Database schema
└── migrations/                  # Generated migrations
```

## Common Patterns

### Protect a Page

```tsx
'use client';
import { useAuthContext, withAuthRequired } from '@/providers/AuthProvider';

function DashboardPage() {
  const { user } = useAuthContext();
  return <div>Hello, {user?.email}</div>;
}

export default withAuthRequired(DashboardPage);
```

### Make Authenticated API Call

```tsx
import { api } from '@/lib/api';

// Token is automatically included
const { user, stats } = await api.get('/api/me');
const { project } = await api.post('/api/projects', { name: 'My Project' });
```

### Custom API Route

```ts
import { withAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export const GET = withAuth(async (req, { user, dbUser }) => {
  // user = Firebase decoded token
  // dbUser = Your database user record
  
  const data = await db.query.projects.findMany({
    where: eq(projects.userId, dbUser.id)
  });
  
  return Response.json({ data });
});
```
