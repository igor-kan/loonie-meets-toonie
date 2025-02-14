import { pgTable, serial, text, numeric, timestamp, boolean, json } from 'drizzle-orm/pg-core';

// Copy all table definitions from src/backend/schema.ts here 

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
    shares_count: numeric('shares_count').default('0')
}); 