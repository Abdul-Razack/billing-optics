import { eq, desc, or, ilike, and, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { locations } from '../db/schema/locations';
import { DbOrTx } from '../types/db';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class LocationRepository {
  static async create(data: typeof locations.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(locations).values(data).returning();
    return result;
  }

  static async update(id: number, data: Partial<typeof locations.$inferInsert>, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .update(locations)
      .set(data)
      .where(eq(locations.id, id))
      .returning();
    return result;
  }

  static async delete(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .delete(locations)
      .where(eq(locations.id, id))
      .returning();
    return result;
  }

  static async findById(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .select()
      .from(locations)
      .where(eq(locations.id, id))
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
          ilike(locations.name, s),
          ilike(locations.code, s)
        ) as ReturnType<typeof eq>
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(locations.isActive, filters.isActive));
    }

    const whereClause = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const [countResult, dataResult] = await Promise.all([
      dbClient.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(locations)
        .where(whereClause),
      dbClient.select()
        .from(locations)
        .where(whereClause)
        .orderBy(desc(locations.createdAt))
        .limit(limit)
        .offset(offset)
    ]);

    return buildPaginatedResponse(dataResult, countResult[0].count, page, limit);
  }
}
