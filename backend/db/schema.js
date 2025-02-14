"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteSchema = exports.votesTable = exports.productSchema = exports.productsTable = void 0;
// backend/db/schema.ts
const zod_1 = require("zod");
const pg_core_1 = require("drizzle-orm/pg-core");
// Define the "products" table
exports.productsTable = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    asin: (0, pg_core_1.text)("asin").notNull().unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    url: (0, pg_core_1.text)("url").notNull(),
    canadianScore: (0, pg_core_1.integer)("canadian_score").notNull(),
    rawData: (0, pg_core_1.text)("raw_data"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Zod schema for product validation
exports.productSchema = zod_1.z.object({
    asin: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    canadianScore: zod_1.z.number().int().min(0).max(100),
    rawData: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional()
});
// Define the "votes" table
exports.votesTable = (0, pg_core_1.pgTable)("votes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("product_id").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull(),
    vote: (0, pg_core_1.integer)("vote").notNull(),
    review: (0, pg_core_1.text)("review"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Zod schema for vote validation
exports.voteSchema = zod_1.z.object({
    productId: zod_1.z.number().int(),
    userId: zod_1.z.string(),
    vote: zod_1.z.number().int().refine((val) => val === 1 || val === -1, {
        message: "Vote must be either 1 or -1"
    }),
    review: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional()
});
