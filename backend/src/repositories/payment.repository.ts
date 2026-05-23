import { DbOrTx } from '../types/db';
import { payments } from '../db/schema';

export class PaymentRepository {
  async createPayment(data: typeof payments.$inferInsert, tx: DbOrTx) {
    const result = await tx.insert(payments).values(data).returning();
    return result[0];
  }
}
