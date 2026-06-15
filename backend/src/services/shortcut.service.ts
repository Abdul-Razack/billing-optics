import { db } from '../config/db';
import { posShortcuts } from '../db/schema';
import { products } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ShortcutService {
  async getAllShortcuts() {
    return await db.select({
      id: posShortcuts.id,
      shortcutKey: posShortcuts.shortcutKey,
      productId: posShortcuts.productId,
      productName: products.name,
      productSku: products.sku,
    })
    .from(posShortcuts)
    .innerJoin(products, eq(posShortcuts.productId, products.id))
    .orderBy(desc(posShortcuts.createdAt));
  }

  async createShortcut(shortcutKey: string, productId: number) {
    if (!shortcutKey || shortcutKey.trim() === '') {
      throw new ValidationError('Shortcut key is required');
    }

    const existing = await db.select().from(posShortcuts).where(eq(posShortcuts.shortcutKey, shortcutKey)).limit(1);
    if (existing.length > 0) {
      throw new ValidationError(`Shortcut key '${shortcutKey}' is already in use.`);
    }

    const [result] = await db.insert(posShortcuts).values({
      shortcutKey: shortcutKey.trim().toUpperCase(),
      productId,
    }).returning();
    
    return result;
  }

  async deleteShortcut(id: number) {
    const [result] = await db.delete(posShortcuts).where(eq(posShortcuts.id, id)).returning();
    if (!result) {
      throw new NotFoundError('Shortcut not found');
    }
    return result;
  }
}
