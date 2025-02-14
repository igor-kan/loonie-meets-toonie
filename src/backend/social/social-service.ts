import { db } from '../db';
import { shares, products, users } from '../schema';
import { eq, and, desc, sql } from 'drizzle-orm';

interface ShareData {
    productId: number;
    userId: string;
    platform: string;
    message?: string;
    url: string;
}

export class SocialService {
    async createShare(data: ShareData) {
        // Validate product exists
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, data.productId))
            .limit(1);

        if (!product) {
            throw new Error('Product not found');
        }
        // Create share record
        const share = await db.insert(shares).values({
            productId: data.productId,
            userId: data.userId,
            platform: data.platform,
            message: data.message,
            url: data.url,
            createdAt: new Date()
        }).returning();

        // Update share count on product
        await db.update(products)
            .set({
                shares_count: sql`${products.shares_count} + 1`
            })
            .where(eq(products.id, data.productId));

        return share[0];
    }

    async getPopularShares(limit: number = 10) {
        return await db
            .select({
                productId: shares.productId,
                productName: products.name,
                shareCount: sql<number>`count(*)`,
                platforms: sql`array_agg(distinct ${shares.platform})`
            })
            .from(shares)
            .innerJoin(products, eq(shares.productId, products.id))
            .groupBy(shares.productId, products.name)
            .orderBy(desc(sql`count(*)`))
            .limit(limit);
    }

    async getUserShares(userId: string) {
        return await db
            .select({
                id: shares.id,
                productId: shares.productId,
                productName: products.name,
                platform: shares.platform,
                message: shares.message,
                url: shares.url,
                createdAt: shares.createdAt
            })
            .from(shares)
            .innerJoin(products, eq(shares.productId, products.id))
            .where(eq(shares.userId, userId))
            .orderBy(desc(shares.createdAt));
    }
} 