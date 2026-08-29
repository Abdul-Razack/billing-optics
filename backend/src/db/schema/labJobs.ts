import { pgTable, bigserial, bigint, integer, varchar, timestamp, date, index } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { orderItems } from './orderItems';
import { prescriptions } from './prescriptions';
import { vendors } from './vendors';
import { labJobStatusEnum } from './enums';

export const labJobs = pgTable('lab_jobs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  orderId: bigint('order_id', { mode: 'number' })
    .references(() => orders.id, { onDelete: 'restrict' })
    .notNull(),
  /**
   * Links this lab job to the specific lens line item on the order.
   * Enables the clinical chain: Order → OrderItem → LabJob → Prescription.
   * Nullable because lab jobs can be created without a specific line item reference.
   */
  orderItemId: bigint('order_item_id', { mode: 'number' })
    .references(() => orderItems.id, { onDelete: 'set null' }),
  /**
   * Links this lab job to the patient's prescription that drove the order.
   * Enables lookups: "Which lab jobs were created for this patient's Rx?"
   * Nullable for non-prescription lab jobs (e.g., frame repairs).
   */
  prescriptionId: integer('prescription_id')
    .references(() => prescriptions.id, { onDelete: 'set null' }),
  vendorId: bigint('vendor_id', { mode: 'number' })
    .references(() => vendors.id, { onDelete: 'restrict' }),
  status: labJobStatusEnum('status').notNull().default('PENDING'),
  notes: varchar('notes', { length: 1000 }),
  expectedDate: date('expected_date'),
  sentDate: date('sent_date'),
  receivedDate: date('received_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  orderIdIdx: index('lab_jobs_order_id_idx').on(table.orderId),
  orderItemIdIdx: index('lab_jobs_order_item_id_idx').on(table.orderItemId),
  prescriptionIdIdx: index('lab_jobs_prescription_id_idx').on(table.prescriptionId),
  vendorIdIdx: index('lab_jobs_vendor_id_idx').on(table.vendorId),
  statusIdx: index('lab_jobs_status_idx').on(table.status),
}));

