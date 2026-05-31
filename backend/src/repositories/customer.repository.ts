import { eq, desc, or, ilike, and, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { customers } from '../db/schema/customers';
import { prescriptions } from '../db/schema/prescriptions';
import { DbOrTx } from '../types/db';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class CustomerRepository {
  static async create(data: typeof customers.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(customers).values(data).returning();
    return result;
  }

  static async update(id: number, data: Partial<typeof customers.$inferInsert>, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();
    return result;
  }

  static async delete(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();
    return result;
  }

  static async findById(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .select()
      .from(customers)
      .where(eq(customers.id, id))
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
          ilike(customers.fullName, s),
          ilike(customers.phone, s),
          ilike(customers.email, s)
        ) as ReturnType<typeof eq>
      );
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(customers.isActive, filters.isActive));
    }

    const whereClause = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const [countResult, dataResult] = await Promise.all([
      dbClient.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(customers)
        .where(whereClause),
      dbClient.select()
        .from(customers)
        .where(whereClause)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset)
    ]);

    return buildPaginatedResponse(dataResult, countResult[0].count, page, limit);
  }

  static async addPrescription(data: typeof prescriptions.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(prescriptions).values(data).returning();
    return result;
  }

  static async findPrescriptionsByCustomerId(customerId: number, dbClient: DbOrTx = db) {
    return await dbClient
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.customerId, customerId))
      .orderBy(desc(prescriptions.createdAt));
  }
}
