import { db } from '../db';
import { shoppingLists, shoppingItems, products } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

interface ShoppingItem {
    id: number;
    productId: number;
    quantity: number;
    purchased: boolean;
    price?: number;
    notes: string | null;
    productName?: string;
    productImage?: string | null;
}

interface ShoppingList {
    id: number;
    name: string;
    userId: string;
    items: ShoppingItem[];
    totalBudget?: number;
    createdAt: Date;
    updatedAt: Date;
}

export class ShoppingListService {
    async createList(userId: string, name: string, totalBudget?: number): Promise<ShoppingList> {
        const [list] = await db.insert(shoppingLists).values({
            userId,
            name,
            totalBudget: totalBudget?.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        return {
            ...list,
            items: [],
            totalBudget: list.totalBudget ? Number(list.totalBudget) : undefined,
            createdAt: list.createdAt || new Date(),
            updatedAt: list.updatedAt || new Date()
        };
    }
    async addItem(listId: number, productId: number, quantity: number = 1, notes?: string) {
        
        const [item] = await db.insert(shoppingItems).values({
            listId,
            productId,
            quantity: quantity.toString(),
            notes,
            purchased: false,
            createdAt: new Date()
        }).returning();

        return item;
    }

    async updateItem(itemId: number, updates: Partial<ShoppingItem>) {
        const [updated] = await db.update(shoppingItems)
            .set({
                ...updates,
                quantity: updates.quantity?.toString(),
                updatedAt: new Date()
            })
            .where(eq(shoppingItems.id, itemId))
            .returning();

        return updated;
    }

    async getList(listId: number): Promise<ShoppingList> {
        const [list] = await db.select()
            .from(shoppingLists)
            .where(eq(shoppingLists.id, listId))
            .limit(1);

        if (!list) {
            throw new Error('Shopping list not found');
        }

        const items = await db.select({
            id: shoppingItems.id,
            productId: shoppingItems.productId,
            quantity: shoppingItems.quantity,
            purchased: shoppingItems.purchased,
            price: products.price,
            notes: shoppingItems.notes,
            productName: products.name,
            productImage: products.imageUrl
        })
        .from(shoppingItems)
        .innerJoin(products, eq(shoppingItems.productId, products.id))
        .where(eq(shoppingItems.listId, listId))
        .orderBy(desc(shoppingItems.createdAt));

        return {
            ...list,
            totalBudget: list.totalBudget ? Number(list.totalBudget) : undefined,
            createdAt: list.createdAt || new Date(),
            updatedAt: list.updatedAt || new Date(),
            items: items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                purchased: item.purchased ?? false,
                price: Number(item.price)
            }))
        };
    }

    async getUserLists(userId: string): Promise<ShoppingList[]> {
        const lists = await db.select()
            .from(shoppingLists)


            
            .where(eq(shoppingLists.userId, userId))
            .orderBy(desc(shoppingLists.updatedAt));

        return Promise.all(lists.map(list => this.getList(list.id)));
    }

    async deleteList(listId: number) {
        await db.transaction(async (tx) => {
            await tx.delete(shoppingItems)
                .where(eq(shoppingItems.listId, listId));
            
            await tx.delete(shoppingLists)
                .where(eq(shoppingLists.id, listId));
        });
    }

    async calculateTotals(listId: number) {
        const items = await db.select({
            price: products.price,
            quantity: shoppingItems.quantity,
            purchased: shoppingItems.purchased
        })
        .from(shoppingItems)
        .innerJoin(products, eq(shoppingItems.productId, products.id))
        .where(eq(shoppingItems.listId, listId));

        return {
            totalItems: items.length,
            purchasedItems: items.filter(i => i.purchased).length,
            totalCost: items.reduce((sum, item) => 
                sum + (Number(item.price) * Number(item.quantity)), 0),
            purchasedCost: items
                .filter(i => i.purchased)
                .reduce((sum, item) => 
                    sum + (Number(item.price) * Number(item.quantity)), 0)
        };
    }
} 