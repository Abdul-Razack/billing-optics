import { pgTable, bigserial, bigint, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { purchases } from './purchases';
import { adjustmentTypeEnum } from './enums';
import { users } from './users';

export const purchaseAdjustments = pgTable('purchase_adjustments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  purchaseId: bigint('purchase_id', { mode: 'number' })
    .references(() => purchases.id, { onDelete: 'cascade' })
    .notNull(),
  adjustmentType: adjustmentTypeEnum('adjustment_type').notNull(),
  amount: integer('amount').notNull().default(0),
  notes: varchar('notes', { length: 500 }),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  purchaseIdIdx: index('purchase_adjustments_purchase_id_idx').on(table.purchaseId),
}));
