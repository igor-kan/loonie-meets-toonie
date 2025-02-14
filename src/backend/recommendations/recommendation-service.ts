import { db } from '../db';
import { products, users, purchases } from '../schema';
import { eq, and, sql, desc } from 'drizzle-orm';

interface RecommendationScore {
    productId: number;
    score: number;
    factors: {
        categoryAffinity: number;
        purchaseHistory: number;
        popularity: number;
        canadianContent: number;
    };
}

export class RecommendationService {
    async getRecommendations(userId: string, limit: number = 10) {
        const [
            userPreferences,
            purchaseHistory,
            popularProducts
        ] = await Promise.all([
            this.getUserPreferences(userId),
            this.getUserPurchaseHistory(userId),
            this.getPopularProducts()
        ]);

        // Calculate scores for all potential recommendations
        const scoredProducts = await this.scoreProducts(
            userId,
            userPreferences,
            purchaseHistory,
            popularProducts
        );

        // Sort by score and return top recommendations
        return scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    private async getUserPreferences(userId: string) {
        const user = await db
            .select({
                preferences: users.preferences
            })
            .from(users)
            .where(eq(users.id, userId))
            .execute()
            .then((results: { preferences: any }[]) => results[0]);

        return user?.preferences || {};
    }

    private async getUserPurchaseHistory(userId: string) {
        return await db
            .select({
                productId: purchases.product_id,
                category: products.category,
                purchaseDate: purchases.created_at
            })
            .from(purchases)
            .innerJoin(products, eq(purchases.product_id, products.id))
            .where(eq(purchases.user_id, userId))
            .orderBy(desc(purchases.created_at));
    }

    private async getPopularProducts() {
        return await db
            .select({
                productId: purchases.product_id,
                count: sql<number>`count(*)`
            })
            .from(purchases)
            .groupBy(purchases.product_id)
            .orderBy(desc(sql`count(*)`))
            .limit(100);
    }

    private async scoreProducts(
        userId: string,
        preferences: any,
        purchaseHistory: any[],
        popularProducts: any[]
    ): Promise<RecommendationScore[]> {
        const productList = await db
            .select()
            .from(products)
            .where(eq(products.isActive, true));

        return Promise.all(productList.map(async (product: typeof products.$inferSelect) => {
            const categoryAffinity = this.calculateCategoryAffinity(
                product.category || '', // Handle potential null case
                preferences,
                purchaseHistory
            );

            const purchaseHistoryScore = this.calculatePurchaseHistoryScore(
                product.id,
                purchaseHistory
            );

            const popularityScore = this.calculatePopularityScore(
                product.id,
                popularProducts
            );

            const canadianContentScore = product.isCanadian ? 1.0 : 0.5;

            // Calculate final score with weights
            const score = (
                categoryAffinity * 0.3 +
                purchaseHistoryScore * 0.2 +
                popularityScore * 0.2 +
                canadianContentScore * 0.3
            );

            return {
                productId: product.id,
                score,
                factors: {
                    categoryAffinity,
                    purchaseHistory: purchaseHistoryScore,
                    popularity: popularityScore,
                    canadianContent: canadianContentScore
                }
            };
        }));
    }

    private calculateCategoryAffinity(
        category: string,
        preferences: any,
        purchaseHistory: any[]
    ): number {
        // Calculate based on user preferences
        const preferenceScore = preferences.categories?.includes(category) ? 1.0 : 0.5;

        // Calculate based on purchase history
        const categoryPurchases = purchaseHistory.filter(p => p.category === category).length;
        const historyScore = Math.min(categoryPurchases / 5, 1); // Cap at 5 purchases

        return (preferenceScore + historyScore) / 2;
    }

    private calculatePurchaseHistoryScore(
        productId: number,
        purchaseHistory: any[]
    ): number {
        // Check if user has purchased this product before
        const hasPurchased = purchaseHistory.some(p => p.productId === productId);
        
        // Lower score if already purchased to promote variety
        return hasPurchased ? 0.3 : 1.0;
    }

    private calculatePopularityScore(
        productId: number,
        popularProducts: any[]
    ): number {
        const product = popularProducts.find(p => p.productId === productId);
        if (!product) return 0;

        // Normalize by maximum purchase count
        const maxCount = popularProducts[0].count;
        return product.count / maxCount;
    }
} 