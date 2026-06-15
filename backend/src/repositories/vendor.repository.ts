import { eq, desc, or, ilike, and, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { vendors } from '../db/schema/vendors';
import { DbOrTx } from '../types/db';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class VendorRepository {
  static async create(data: typeof vendors.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(vendors).values(data).returning();
    return result;
  }

  static async update(id: number, data: Partial<typeof vendors.$inferInsert>, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .update(vendors)
      .set(data)
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  static async delete(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .delete(vendors)
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  static async findById(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);
    return result;
  }

  static async findAll(filters: { search?: string; isActive?: boolean; page?: number; limit?: number }, dbClient: DbOrTx = db) {
    const { page, limit, offset } = getPaginationParams(filters.page, filters.limit);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.search) {
      const s = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(vendors.name, s),
          ilike(vendors.contactPerson, s),
          ilike(vendors.phone, s)
        ) as ReturnType<typeof eq>
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(vendors.isActive, filters.isActive));
    }

    const whereClause = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const [countResult, dataResult] = await Promise.all([
      dbClient.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(vendors)
        .where(whereClause),
      dbClient.select()
        .from(vendors)
        .where(whereClause)
        .orderBy(desc(vendors.createdAt))
        .limit(limit)
        .offset(offset)
    ]);

    return buildPaginatedResponse(dataResult, countResult[0].count, page, limit);
  }
}
