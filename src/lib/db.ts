import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/drizzle/schema';

// Enable connection caching for better performance
neonConfig.fetchConnectionCache = true;

// Create the SQL client
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export raw sql for complex queries
export { sql };

// Type helper for transactions
export type DB = typeof db;
