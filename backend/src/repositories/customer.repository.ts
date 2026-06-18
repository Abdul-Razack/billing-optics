import { eq, desc, or, ilike, and, sql, inArray } from 'drizzle-orm';
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

  static async addPrescription(data: any, dbClient: DbOrTx = db) {
    const { tests, ...prescriptionData } = data;
    const [result] = await dbClient.insert(prescriptions).values(prescriptionData).returning();
    
    if (tests && tests.length > 0) {
      const testsToInsert = tests.map((t: any) => ({
        ...t,
        prescriptionId: result.id
      }));
      await dbClient.insert(require('../db/schema/prescriptions').prescriptionTests).values(testsToInsert);
    }
    
    return result;
  }

  static async findPrescriptionsByCustomerId(customerId: number, dbClient: DbOrTx = db) {
    return await dbClient.query.prescriptions.findMany({
      where: eq(prescriptions.customerId, customerId),
      orderBy: desc(prescriptions.createdAt),
      with: {
        tests: true
      }
    });
  }

  static async findBirthdays(month: number, dbClient: DbOrTx = db) {
    return await dbClient
      .select()
      .from(customers)
      .where(sql`EXTRACT(MONTH FROM ${customers.dateOfBirth}) = ${month}`)
      .orderBy(sql`EXTRACT(DAY FROM ${customers.dateOfBirth})`);
  }

  static async findAnniversaries(month: number, dbClient: DbOrTx = db) {
    return await dbClient
      .select()
      .from(customers)
      .where(sql`EXTRACT(MONTH FROM ${customers.anniversaryDate}) = ${month}`)
      .orderBy(sql`EXTRACT(DAY FROM ${customers.anniversaryDate})`);
  }

  static async findTopReferrers(limit: number = 10, dbClient: DbOrTx = db) {
    const referralCounts = await dbClient
      .select({
        id: customers.referredBy,
        referralCount: sql<number>`cast(count(*) as integer)`
      })
      .from(customers)
      .where(sql`${customers.referredBy} IS NOT NULL`)
      .groupBy(customers.referredBy)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    if (referralCounts.length === 0) return [];
    
    const referrerIds = referralCounts.map(r => Number(r.id));
    const referrers = await dbClient
      .select()
      .from(customers)
      .where(inArray(customers.id, referrerIds));
      
    // Return mapped array retaining the sorted order
    return referralCounts.map(r => {
      const customer = referrers.find(c => c.id === Number(r.id));
      return {
        ...customer,
        referralCount: r.referralCount
      };
    }).filter(r => r.id); // Remove any nulls if mapping fails
  }

  static async findLoyaltyLeaderboard(limit: number = 50, dbClient: DbOrTx = db) {
    return await dbClient
      .select()
      .from(customers)
      .where(sql`${customers.loyaltyPoints} > 0`)
      .orderBy(desc(customers.loyaltyPoints))
      .limit(limit);
  }
}
