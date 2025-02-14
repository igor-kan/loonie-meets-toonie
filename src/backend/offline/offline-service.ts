import { db } from '../db';
import { products, categories, stores, users } from '../schema';
import { eq, and, sql, gte } from 'drizzle-orm';

interface CacheConfig {
    products: {
        maxItems: number;
        expirationDays: number;
    };
    categories: {
        maxItems: number;
        expirationDays: number;
    };
    stores: {
        maxItems: number;
        expirationDays: number;
    };
}

export class OfflineService {
    private config: CacheConfig = {
        products: {
            maxItems: 1000,
            expirationDays: 7
        },
        categories: {
            maxItems: 100,
            expirationDays: 30
        },
        stores: {
            maxItems: 500,
            expirationDays: 14
        }
    };

    async prepareOfflineData(userId: string) {
        const [
            frequentProducts,
            popularCategories,
            nearbyStores
        ] = await Promise.all([
            this.getFrequentProducts(userId),
            this.getPopularCategories(),
            this.getNearbyStores(userId)
        ]);

        return {
            timestamp: new Date().toISOString(),
            products: frequentProducts,
            categories: popularCategories,
            stores: nearbyStores,
            config: this.config
        };
    }

    private async getFrequentProducts(userId: string) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - this.config.products.expirationDays);

        return await db
            .select({
                id: products.id,
                name: products.name,
                price: products.price,
                description: products.description,
                manufacturer: products.manufacturer,
                category: products.category,
                isCanadian: products.isCanadian,
                imageUrl: products.imageUrl,
                updatedAt: products.updatedAt
            })
            .from(products)
            .where(and(
                eq(products.isActive, true),
                gte(products.updatedAt, expirationDate)
            ))
            .limit(this.config.products.maxItems);
    }

    private async getPopularCategories() {
        return await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                productCount: sql<number>`count(${products.id})`
            })
            .from(categories)
            .leftJoin(products, eq(products.category, categories.name))
            .groupBy(categories.id)
            .orderBy(sql`count(${products.id}) desc`)
            .limit(this.config.categories.maxItems);
    }

    private async getNearbyStores(userId: string) {
        // Get user's location from their profile
        const [user] = await db
            .select({
                location: users.location
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user?.location) {
            return [];
        }

        const { longitude, latitude } = user.location;

        // Find stores near the user's location
        return await db
            .select({
                id: stores.id,
                name: stores.name,
                address: stores.address,
                location: stores.location,
                phone: stores.phone,
                website: stores.website,
                hours: stores.hours
            })
            .from(stores)
            .where(sql`
                ST_Distance(
                    ${stores.location}::geography,
                    ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
                ) <= 50000
            `) // Within 50km
            .limit(this.config.stores.maxItems);
    }

    async validateOfflineData(data: any) {
        const now = new Date();
        const timestamp = new Date(data.timestamp);
        const daysSinceSync = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);

        return {
            products: daysSinceSync <= this.config.products.expirationDays,
            categories: daysSinceSync <= this.config.categories.expirationDays,
            stores: daysSinceSync <= this.config.stores.expirationDays
        };
    }
} 

