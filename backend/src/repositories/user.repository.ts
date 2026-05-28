import { eq, sql, desc, asc, ilike, or, and } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '../db/schema/users';
import { DbOrTx } from '../types/db';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string; // 'true' or 'false' from query string
}

export class UserRepository {
  async findAll(query: UserQuery) {
    const { page, limit, offset } = getPaginationParams(query.page, query.limit);

    const conditions = [];

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        or(
          ilike(users.fullName, searchTerm),
          ilike(users.email, searchTerm)
        )
      );
    }

    if (query.role) {
      conditions.push(eq(users.role, query.role as any));
    }

    if (query.isActive !== undefined) {
      conditions.push(eq(users.isActive, query.isActive === 'true'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [records, countResult] = await Promise.all([
      db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
      
      db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users)
      .where(whereClause)
    ]);

    const totalRecords = Number(countResult[0].count);

    return buildPaginatedResponse(records, totalRecords, page, limit);
  }

  async findById(id: number) {
    const result = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0];
  }

  async findByEmail(email: string) {
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async create(data: (typeof users.$inferInsert)) {
    const [inserted] = await db.insert(users).values(data).returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      preferences: users.preferences,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
    return inserted;
  }

  async update(id: number, data: Partial<typeof users.$inferInsert>) {
    const [updated] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      preferences: users.preferences,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
    return updated;
  }
}
