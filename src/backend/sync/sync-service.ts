import { db } from '../db';
import { syncLog, users, products, purchases } from '../schema';
import { eq, gt, and, desc } from 'drizzle-orm';

interface SyncState {
    lastSyncTimestamp: Date;
    deviceId: string;
    userId: string;
}

export class SyncService {
    async syncData(state: SyncState) {
        try {
            // Begin transaction
            return await db.transaction(async (tx) => {
                // Get changes since last sync
                const changes = await this.getChangesSinceLastSync(state.lastSyncTimestamp);
                
                // Log sync attempt
                await tx.insert(syncLog).values({
                    status: 'started',
                    details: {
                        userId: state.userId,
                        deviceId: state.deviceId,
                        timestamp: new Date()
                    }
                });

                // Process changes
                const result = await this.processChanges(changes, tx);

                // Update sync status
                const [logEntry] = await tx.select()
                    .from(syncLog)
                    .where(eq(syncLog.id, 
                        db.select({ id: syncLog.id }).from(syncLog).orderBy(desc(syncLog.id)).limit(1)
                    ))
                    .limit(1);
                await tx.update(syncLog)
                    .set({ status: 'completed' })
                    .where(eq(syncLog.id, logEntry.id));

                return {
                    success: true,
                    timestamp: new Date(),
                    changes: result
                };
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await db.insert(syncLog).values({
                status: 'failed',
                details: {
                    userId: state.userId,
                    deviceId: state.deviceId,
                    timestamp: new Date(),
                    error: errorMessage
                }
            });
            throw error;
        }
    }

    private async getChangesSinceLastSync(lastSync: Date) {
        const [
            userChanges,
            productChanges,
            purchaseChanges
        ] = await Promise.all([
            db.select()
                .from(users)
                .where(gt(users.updated_at, lastSync)),
            
            db.select()
                .from(products)
                .where(gt(products.updated_at, lastSync)),
            
            db.select()
                .from(purchases)
                .where(gt(purchases.created_at, lastSync))
        ]);

        return {
            users: userChanges,
            products: productChanges,
            purchases: purchaseChanges
        };
    }

    private async processChanges(changes: any, tx: any) {
        const processed = {
            users: 0,
            products: 0,
            purchases: 0
        };

        // Process user changes
        if (changes.users.length > 0) {
            await tx.insert(users)
                .values(changes.users)
                .onConflictDoUpdate({
                    target: users.id,
                    set: {
                        updatedAt: new Date()
                    }
                });
            processed.users = changes.users.length;
        }

        // Process product changes
        if (changes.products.length > 0) {
            await tx.insert(products)
                .values(changes.products)
                .onConflictDoUpdate({
                    target: products.id,
                    set: {
                        updatedAt: new Date()
                    }
                });
            processed.products = changes.products.length;
        }

        // Process purchase changes
        if (changes.purchases.length > 0) {
            await tx.insert(purchases)
                .values(changes.purchases);
            processed.purchases = changes.purchases.length;
        }

        return processed;
    }
} 