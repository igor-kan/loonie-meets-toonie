// backend/db/schema.ts
import { z } from "zod";
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Define the "products" table
export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  asin: text("asin").notNull().unique(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  canadianScore: integer("canadian_score").notNull(),
  rawData: text("raw_data"),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schema for product validation
export const productSchema = z.object({
  asin: z.string(),
  name: z.string(),
  url: z.string().url(),
  canadianScore: z.number().int().min(0).max(100),
  rawData: z.string().optional(),
  createdAt: z.date().optional()
});

// Define the "votes" table
export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: text("user_id").notNull(),
  vote: integer("vote").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schema for vote validation
export const voteSchema = z.object({
  productId: z.number().int(),
  userId: z.string(),
  vote: z.number().int().refine((val) => val === 1 || val === -1, {
    message: "Vote must be either 1 or -1"
  }),
  review: z.string().optional(),
  createdAt: z.date().optional()
});
