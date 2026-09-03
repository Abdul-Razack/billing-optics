import { db } from '../config/db';
import { categories, products } from '../db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import { ConflictError, NotFoundError } from '../utils/errors';

export class CategoryService {
  async getAll() {
    const results = await db
      .select({
        id: categories.id,
        parentId: categories.parentId,
        name: categories.name,
        description: categories.description,
        attributeSchema: categories.attributeSchema,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        productCount: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id)
      .orderBy(
        sql`CASE 
          WHEN LOWER(${categories.name}) LIKE '%frame%' THEN 1
          WHEN LOWER(${categories.name}) LIKE '%sunglass%' THEN 2
          WHEN LOWER(${categories.name}) LIKE '%contact%' THEN 4
          WHEN LOWER(${categories.name}) LIKE '%lens%' THEN 3
          WHEN LOWER(${categories.name}) LIKE '%solution%' THEN 5
          WHEN LOWER(${categories.name}) LIKE '%other%' THEN 6
          WHEN LOWER(${categories.name}) LIKE '%non-chargeable%' OR LOWER(${categories.name}) LIKE '%non chargeable%' THEN 7
          ELSE 99 END`,
        asc(categories.id)
      );

    return results;
  }

  async create(data: any) {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async getById(id: number) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async update(id: number, data: any) {
    const [category] = await db.update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async delete(id: number) {
    // Check if category exists
    const [existing] = await db.select().from(categories).where(eq(categories.id, id));
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    // Safeguard: Check if any products are linked to this category
    const [linkedProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (linkedProduct) {
      throw new ConflictError(
        'Cannot delete category because it has active products assigned to it. Please reassign the products or set the category to inactive instead.'
      );
    }

    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return deleted;
  }
}

export const categoryService = new CategoryService();

