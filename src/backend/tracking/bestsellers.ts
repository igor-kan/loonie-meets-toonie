import { db } from '../db';
import { products, sales, categories } from '../schema';
import { and, eq, gte, sql, desc, gt, lt } from 'drizzle-orm';

interface BestSellerMetrics {
    totalSales: number;
    averageRating: number;
    priceHistory: {
        date: Date;
        price: number;
    }[];
    trending: boolean;
}

export class BestSellersService {
    async getBestSellers(category: string, timeRange: string) {
        const startDate = this.getStartDate(timeRange);
        
        const query = db
            .select({
                productId: sales.product_id,
                totalSales: sql<number>`count(*)`,
                revenue: sql<number>`sum(${sales.total_amount})`,
            })
            .from(sales)
            .where(
                and(
                    gt(sales.created_at, startDate),
                    category === 'all' 
                        ? undefined 
                        : eq(products.category, category)
                )
            )
            .groupBy(sales.product_id)
            .orderBy(sql`count(*) desc`)
            .limit(20);

        const topProducts = await query;
        
        // Fetch additional metrics for each product
        const enrichedProducts = await Promise.all(
            topProducts.map(async (product) => {
                const metrics = await this.getProductMetrics(
                    product.productId as number,
                    startDate
                );
                
                return {
                    ...product,
                    ...metrics,
                };
            })
        );

        return enrichedProducts;
    }

    private getStartDate(timeRange: string): Date {
        const now = new Date();
        switch (timeRange) {
            case 'day':
                return new Date(now.setDate(now.getDate() - 1));
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            default:
                return new Date(now.setDate(now.getDate() - 7));
        }
    }

    private async getProductMetrics(
        productId: number,
        startDate: Date
    ): Promise<BestSellerMetrics> {
        // Get sales data
        const [salesData] = await db
            .select({
                totalSales: sql<number>`count(*)`,
                avgRating: sql<number>`avg(rating)`,
            })
            .from(sales)
            .where(
                and(
                    eq(sales.product_id, productId),
                    gt(sales.created_at, startDate)
                )
            )
            .groupBy(sales.product_id)
            .limit(1);

        // Get price history
        const priceHistory = await db
            .select({
                date: sql<Date>`COALESCE(${sales.created_at}, NOW())`,
                price: sql<number>`CAST(${sales.price} AS DECIMAL)`,
            })
            .from(sales)
            .where(eq(sales.product_id, productId))
            .orderBy(sales.created_at);

        // Calculate if trending
        const recentSales = await this.getRecentSalesGrowth(
            productId,
            startDate
        );

        return {
            totalSales: salesData?.totalSales || 0,
            averageRating: salesData?.avgRating || 0,
            priceHistory: priceHistory,
            trending: recentSales > 1.5 // 50% growth indicates trending
        };
    }

    private async getRecentSalesGrowth(
        productId: number,
        startDate: Date
    ): Promise<number> {
        const midPoint = new Date(
            (startDate.getTime() + new Date().getTime()) / 2
        );

        const [firstHalf, secondHalf] = await Promise.all([
            db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(sales)
                .where(
                    and(
                        eq(sales.product_id, productId),
                        gt(sales.created_at, startDate),
                        lt(sales.created_at, midPoint)
                    )
                ),
            db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(sales)
                .where(
                    and(
                        eq(sales.product_id, productId),
                        gt(sales.created_at, midPoint)
                    )
                ),
        ]);

        const firstHalfSales = firstHalf[0]?.count || 1;
        const secondHalfSales = secondHalf[0]?.count || 0;

        return secondHalfSales / firstHalfSales;
    }
} 