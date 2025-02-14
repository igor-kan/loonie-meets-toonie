import express from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';

const app = express();
const port = 3000;

// Configure postgres client
const client = postgres(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db');
const db = drizzle(client);

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Database schema
const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    currentPrice: numeric('current_price').notNull(),
    lowestPrice: numeric('lowest_price').notNull(),
    highestPrice: numeric('highest_price').notNull(),
    category: text('category'),
    createdAt: timestamp('created_at').defaultNow(),
});

const priceHistory = pgTable('price_history', {
    id: serial('id').primaryKey(),
    productId: numeric('product_id').notNull(),
    price: numeric('price').notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
});

const alerts = pgTable('alerts', {
    id: serial('id').primaryKey(),
    productId: numeric('product_id').notNull(),
    targetPrice: numeric('target_price').notNull(),
    userId: text('user_id').notNull(),
    notificationMethod: text('notification_method').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// API Routes
app.get('/api/products/search', async (req, res) => {
    const query = z.string().parse(req.query.q);
    const category = z.string().optional().parse(req.query.category);

    try {
        const searchResults = await db.select()
            .from(products)
            .where(
                category 
                    ? eq(products.category, category) 
                    : undefined
            )
            .limit(20);

        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.get('/api/products/:id/price-history', async (req, res) => {
    const productId = z.number().parse(parseInt(req.params.id));

    try {
        const history = await db.select()
            .from(priceHistory)
            .where(eq(priceHistory.productId, productId.toString()))
            .orderBy(priceHistory.timestamp);

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price history' });
    }
});

app.post('/api/alerts', async (req, res) => {
    const alertSchema = z.object({
        productId: z.number(),
        targetPrice: z.number(),
        userId: z.string(),
        notificationMethod: z.enum(['extension', 'email']),
    });

    try {
        const alertData = alertSchema.parse(req.body);
        const newAlert = await db.insert(alerts).values({
            ...alertData,
            productId: alertData.productId.toString(),
            targetPrice: alertData.targetPrice.toString()
        });
        res.json(newAlert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    client.end();
    process.exit(0);
}); 