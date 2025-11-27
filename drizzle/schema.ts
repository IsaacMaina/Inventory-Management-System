import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  index,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

// PostgreSQL enums for our application
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'manager', 'viewer']);
export const inventoryTransactionTypeEnum = pgEnum('transaction_type', ['in', 'out', 'adjustment']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('email_idx').on(table.email),
  };
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  suppliers: many(suppliers),
  reports: many(reports),
  notifications: many(notifications),
}));

// Sessions table for NextAuth
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().notNull(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => {
  return {
    sessionTokenIdx: index('session_token_idx').on(table.sessionToken),
  };
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Accounts table for NextAuth
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
  oauthTokenSecret: text('oauth_token_secret'),
  oauthToken: text('oauth_token'),
}, (table) => {
  return {
    providerIdx: index('provider_idx').on(table.provider, table.providerAccountId),
  };
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Verification tokens table for NextAuth
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => {
  return {
    tokenIdx: primaryKey({ columns: [table.identifier, table.token] }),
  };
});

// Additional tables for the inventory management system
export const categories = pgTable('categories', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  parentId: text('parent_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('category_name_idx').on(table.name),
  };
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  notes: text('notes'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [suppliers.id],
  }),
}));

export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode'),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(0).notNull(),
  minQuantity: integer('min_quantity').default(0).notNull(),
  price: integer('price').notNull(), // Stored as integer (cents) for precision
  cost: integer('cost'), // Stored as integer (cents) for precision
  location: text('location'),
  notes: text('notes'),
  images: text('images').array().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    skuIdx: index('sku_idx').on(table.sku),
    nameIdx: index('item_name_idx').on(table.name),
  };
});

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [inventoryItems.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [inventoryItems.supplierId],
    references: [suppliers.id],
  }),
}));

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  type: inventoryTransactionTypeEnum('type').notNull(), // 'in', 'out', 'adjustment'
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  user: one(users, {
    fields: [inventoryTransactions.userId],
    references: [users.id],
  }),
}));

export const reports = pgTable('reports', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  type: text('type').notNull(),
  filters: text('filters', { mode: 'jsonb' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));