import { eq, desc } from 'drizzle-orm';
import { db } from '../config/db';
import { customers } from '../db/schema/customers';
import { prescriptions } from '../db/schema/prescriptions';
import { DbOrTx } from '../types/db';

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

  static async findById(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);
    return result;
  }

  static async findAll(search?: string, dbClient: DbOrTx = db) {
    let query = dbClient.select().from(customers);
    let result = await query;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        (c.fullName && c.fullName.toLowerCase().includes(s)) || 
        (c.phone && c.phone.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s))
      );
    }
    return result;
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
