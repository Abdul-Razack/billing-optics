import { pgTable, bigserial, bigint, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';
import { settings } from './settings';
import { documentTypeEnum, purchaseStatusEnum } from './enums';
import { users } from './users';

import { locations } from './locations';

export const purchases = pgTable('purchases', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  supplierId: bigint('supplier_id', { mode: 'number' })
    .references(() => vendors.id, { onDelete: 'restrict' })
    .notNull(),
  billingBranchId: bigint('billing_branch_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' }),
  receivingBranchId: bigint('receiving_branch_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' }),
  billNumber: varchar('bill_number', { length: 100 }),
  challanNumber: varchar('challan_number', { length: 100 }),
  documentType: documentTypeEnum('document_type').notNull().default('INVOICE'),
  status: purchaseStatusEnum('status').notNull().default('DRAFT'),
  taxRuleId: bigint('tax_rule_id', { mode: 'number' }),
  totalBaseAmount: integer('total_base_amount').notNull().default(0),
  totalTaxAmount: integer('total_tax_amount').notNull().default(0),
  totalDiscountAmount: integer('total_discount_amount').notNull().default(0),
  netAmount: integer('net_amount').notNull().default(0),
  purchaseDate: timestamp('purchase_date'),
  dueDate: timestamp('due_date'),
  notes: varchar('notes', { length: 1000 }),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  supplierIdIdx: index('purchases_supplier_id_idx').on(table.supplierId),
  billNumberIdx: index('purchases_bill_number_idx').on(table.billNumber),
  challanNumberIdx: index('purchases_challan_number_idx').on(table.challanNumber),
  statusIdx: index('purchases_status_idx').on(table.status),
}));
