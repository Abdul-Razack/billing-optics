import { eq, ilike, or, and, desc, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '../db/schema';

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string; // 'true' or 'false' from query string
}

export class UserRepository {
  async findAll(query: UserQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

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

    const records = await db
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
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);
      
    const totalRecords = Number(countResult.count);

    return {
      records,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        limit
      }
    };
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
