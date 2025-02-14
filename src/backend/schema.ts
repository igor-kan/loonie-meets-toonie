import { pgTable, serial, text, numeric, timestamp, boolean, json, jsonb, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    upc: text('upc').notNull().unique(),
    name: text('name').notNull(),
    price: numeric('price').notNull(),
    description: text('description'),
    manufacturer: text('manufacturer'),
    manufacturerLocation: text('manufacturer_location'),
    canadianContentPercentage: numeric('canadian_content_percentage'),
    certifications: json('certifications').$type<string[]>(),
    category: text('category'),
    isCanadian: boolean('is_canadian').default(false),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true),
    updatedAt: timestamp('updated_at').defaultNow(),
    shares_count: numeric('shares_count').default('0'),
    origin: text('origin'),
    verified: integer('verified').default(0),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
});

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description')
});

export const stores = pgTable('stores', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    location: text('location'),
    phone: text('phone'),
    website: text('website'),
    hours: text('hours')
});

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    location: jsonb('location').$type<{ longitude: number, latitude: number }>().notNull(),
    preferences: jsonb('preferences').$type<{ categories?: string[] }>(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    last_active: timestamp('last_active').defaultNow()
});

export const shoppingLists = pgTable('shopping_lists', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    totalBudget: numeric('total_budget'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const shoppingItems = pgTable('shopping_items', {
    id: serial('id').primaryKey(),
    listId: serial('list_id').references(() => shoppingLists.id),
    productId: serial('product_id').references(() => products.id),
    quantity: numeric('quantity').notNull(),
    purchased: boolean('purchased').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const shares = pgTable('shares', {
    id: serial('id').primaryKey(),
    productId: serial('product_id').references(() => products.id),
    userId: text('user_id').notNull(),
    platform: text('platform').notNull(),
    message: text('message'),
    url: text('url').notNull(),
    createdAt: timestamp('created_at').defaultNow()
});

export const purchases = pgTable('purchases', {
    id: serial('id').primaryKey(),
    product_id: integer('product_id').references(() => products.id),
    user_id: text('user_id').references(() => users.id),
    amount: integer('amount').notNull(),
    created_at: timestamp('created_at').defaultNow()
});

export const manufacturers = pgTable('manufacturers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    isCanadian: boolean('is_canadian').default(false),
    avgCanadianContent: numeric('avg_canadian_content'),
    certifications: json('certifications').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow()
});

export const analytics = pgTable('analytics', {
    id: serial('id').primaryKey(),
    event_type: text('event_type').notNull(),
    event_data: jsonb('event_data'),
    created_at: timestamp('created_at').defaultNow()
});

export const syncLog = pgTable('sync_log', {
    id: serial('id').primaryKey(),
    status: text('status').notNull(),
    details: jsonb('details'),
    created_at: timestamp('created_at').defaultNow()
});

export const verificationLogs = pgTable('verification_logs', {
    id: serial('id').primaryKey(),
    product_id: integer('product_id').references(() => products.id),
    status: text('status').notNull(),
    details: text('details'),
    created_at: timestamp('created_at').defaultNow()
});

export const sales = pgTable('sales', {
    id: serial('id').primaryKey(),
    product_id: integer('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    total_amount: numeric('total_amount').notNull(),
    price: numeric('price').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
}); 