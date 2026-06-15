import { pgTable, bigserial, bigint, varchar, timestamp, date, index } from 'drizzle-orm/pg-core';
import { invoices } from './invoices';
import { vendors } from './vendors';
import { labJobStatusEnum } from './enums';

export const labJobs = pgTable('lab_jobs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' })
    .notNull(),
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
  invoiceIdIdx: index('lab_jobs_invoice_id_idx').on(table.invoiceId),
  vendorIdIdx: index('lab_jobs_vendor_id_idx').on(table.vendorId),
  statusIdx: index('lab_jobs_status_idx').on(table.status),
}));
