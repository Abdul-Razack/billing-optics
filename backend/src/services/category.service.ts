import { db } from '../config/db';
import { categories } from '../db/schema';
import { eq } from 'drizzle-orm';

export class CategoryService {
  async getAll() {
    return await db.select().from(categories);
  }

  async create(data: any) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async delete(id: number) {
    // Assuming soft delete or hard delete
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return deleted;
  }
}

export const categoryService = new CategoryService();
