import { pgTable, bigserial, bigint, integer, varchar, timestamp, date, index } from 'drizzle-orm/pg-core';
import { invoices } from './invoices';
import { invoiceItems } from './invoiceItems';
import { prescriptions } from './prescriptions';
import { vendors } from './vendors';
import { labJobStatusEnum } from './enums';

export const labJobs = pgTable('lab_jobs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' })
    .notNull(),
  /**
   * Links this lab job to the specific lens line item on the invoice.
   * Enables the clinical chain: Invoice → InvoiceItem → LabJob → Prescription.
   * Nullable because lab jobs can be created without a specific line item reference.
   */
  invoiceItemId: bigint('invoice_item_id', { mode: 'number' })
    .references(() => invoiceItems.id, { onDelete: 'set null' }),
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
  invoiceIdIdx: index('lab_jobs_invoice_id_idx').on(table.invoiceId),
  invoiceItemIdIdx: index('lab_jobs_invoice_item_id_idx').on(table.invoiceItemId),
  prescriptionIdIdx: index('lab_jobs_prescription_id_idx').on(table.prescriptionId),
  vendorIdIdx: index('lab_jobs_vendor_id_idx').on(table.vendorId),
  statusIdx: index('lab_jobs_status_idx').on(table.status),
}));

