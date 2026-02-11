import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// Users
// ============================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  
  // Subscription/tier tracking
  tier: text('tier').default('free').notNull(), // 'free', 'pro', 'enterprise'
  stripeCustomerId: text('stripe_customer_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Projects (example - customize for your app)
// ============================================

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// API Keys (for user-generated keys)
// ============================================

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(), // Store hashed, not plaintext
  keyPrefix: text('key_prefix').notNull(), // First 8 chars for identification
  
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// Usage Tracking
// ============================================

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  action: text('action').notNull(), // 'api_call', 'export', 'generate', etc.
  count: integer('count').default(1).notNull(),
  metadata: text('metadata'), // JSON string for extra context
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  apiKeys: many(apiKeys),
  usageRecords: many(usageRecords),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  user: one(users, {
    fields: [usageRecords.userId],
    references: [users.id],
  }),
}));
