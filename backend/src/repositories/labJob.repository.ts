import { eq, desc, and, sql, ilike } from 'drizzle-orm';
import { db } from '../config/db';
import { labJobs } from '../db/schema/labJobs';
import { DbOrTx } from '../types/db';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export class LabJobRepository {
  static async create(data: typeof labJobs.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(labJobs).values(data).returning();
    return result;
  }

  static async update(id: number, data: Partial<typeof labJobs.$inferInsert>, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .update(labJobs)
      .set(data)
      .where(eq(labJobs.id, id))
      .returning();
    return result;
  }

  static async delete(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .delete(labJobs)
      .where(eq(labJobs.id, id))
      .returning();
    return result;
  }

  static async findById(id: number, dbClient: DbOrTx = db) {
    const result = await dbClient.query.labJobs.findFirst({
      where: eq(labJobs.id, id),
      with: {
        invoice: true,
        vendor: true,
      }
    });
    return result;
  }

  static async findAll(filters: { search?: string; status?: string; vendorId?: number; invoiceId?: number; page?: number; limit?: number }, dbClient: DbOrTx = db) {
    const { page, limit, offset } = getPaginationParams(filters.page, filters.limit);
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.search) {
      const s = `%${filters.search}%`;
      conditions.push(ilike(labJobs.jobTitle, s) as ReturnType<typeof eq>);
    }
    
    if (filters.status) {
      conditions.push(eq(labJobs.status, filters.status as any));
    }
    if (filters.vendorId !== undefined) {
      conditions.push(eq(labJobs.vendorId, filters.vendorId));
    }
    if (filters.invoiceId !== undefined) {
      conditions.push(eq(labJobs.invoiceId, filters.invoiceId));
    }

    const whereClause = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const [countResult, dataResult] = await Promise.all([
      dbClient.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(labJobs)
        .where(whereClause),
      dbClient.query.labJobs.findMany({
        where: whereClause,
        with: {
          invoice: true,
          vendor: true,
        },
        orderBy: [desc(labJobs.createdAt)],
        limit,
        offset,
      })
    ]);

    return buildPaginatedResponse(dataResult, countResult[0].count, page, limit);
  }
}
