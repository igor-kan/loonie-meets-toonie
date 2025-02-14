import { db } from '../db';
import { analytics, users, products, purchases } from '../schema';
import { and, eq, gte, sql, desc } from 'drizzle-orm';
import { gt, lt } from 'drizzle-orm/expressions';

interface AnalyticsMetrics {
    totalUsers: number;
    activeUsers: number;
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
    topCategories: {
        category: string;
        count: number;
    }[];
    userRetention: number;
    canadianPurchaseRatio: number;
}

export class AnalyticsService {
    async getMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
        const [
            userMetrics,
            purchaseMetrics,
            categoryMetrics,
            retentionRate,
            canadianRatio
        ] = await Promise.all([
            this.getUserMetrics(startDate, endDate),
            this.getPurchaseMetrics(startDate, endDate),
            this.getCategoryMetrics(startDate, endDate),
            this.calculateRetention(startDate, endDate),
            this.calculateCanadianPurchaseRatio(startDate, endDate)
        ]);

        return {
            ...userMetrics,
            ...purchaseMetrics,
            topCategories: categoryMetrics,
            userRetention: retentionRate,
            canadianPurchaseRatio: canadianRatio
        };
    }

    private async getUserMetrics(startDate: Date, endDate: Date) {
        const result = await db
            .select({
                totalUsers: sql<number>`count(distinct ${users.id})`,
                activeUsers: sql<number>`count(distinct case when ${users.last_active} >= ${startDate} then ${users.id} end)`
            })
            .from(users);

        return {
            totalUsers: result[0].totalUsers,
            activeUsers: result[0].activeUsers
        };
    }

    private async getPurchaseMetrics(startDate: Date, endDate: Date) {
        const result = await db
            .select({
                totalPurchases: sql<number>`count(*)`,
                totalSpent: sql<number>`sum(${purchases.amount})`,
                avgOrderValue: sql<number>`avg(${purchases.amount})`
            })
            .from(purchases)
            .where(and(
                gt(purchases.created_at, startDate),
                lt(purchases.created_at, endDate)
            ));

        return {
            totalPurchases: result[0].totalPurchases,
            totalSpent: result[0].totalSpent,
            averageOrderValue: result[0].avgOrderValue
        };
    }

    private async getCategoryMetrics(startDate: Date, endDate: Date) {
        const results = await db
            .select({
                category: sql<string>`COALESCE(${products.category}, 'Uncategorized')`,
                count: sql<number>`count(*)`
            })
            .from(purchases)
            .innerJoin(products, eq(purchases.product_id, products.id))
            .where(and(
                gt(purchases.created_at, startDate),
                lt(purchases.created_at, endDate)
            ))
            .groupBy(products.category)
            .orderBy(sql`count(*) desc`)
            .limit(5);

        return results;
    }

    private async calculateRetention(startDate: Date, endDate: Date) {
        const cohort = await db
            .select({
                totalUsers: sql<number>`count(distinct ${users.id})`,
                returnedUsers: sql<number>`count(distinct case when ${users.last_active} >= ${endDate} then ${users.id} end)`
            })
            .from(users)
            .where(gt(users.created_at, startDate));

        return cohort[0].returnedUsers / cohort[0].totalUsers;
    }

    private async calculateCanadianPurchaseRatio(startDate: Date, endDate: Date) {
        const result = await db
            .select({
                total: sql<number>`count(*)`,
                canadian: sql<number>`count(case when ${products.isCanadian} then 1 end)`
            })
            .from(purchases)
            .innerJoin(products, eq(purchases.product_id, products.id))
            .where(and(
                gt(purchases.created_at, startDate),
                lt(purchases.created_at, endDate)
            ));

        return result[0].canadian / result[0].total;
    }

    async logEvent(userId: string, eventType: string, eventData: any) {
        await db.insert(analytics).values({
            event_type: eventType,
            event_data: { userId, ...eventData },
            created_at: new Date()
        });
    }
} 