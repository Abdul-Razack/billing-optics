import { pgTable, bigserial, bigint, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { productVariants } from './productVariants';
import { inventoryLedger } from './inventoryLedger';
import { barcodeStatusEnum } from './enums';

export const barcodes = pgTable('barcodes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  barcodeString: varchar('barcode_string', { length: 100 }).unique().notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' })
    .notNull(),
  inventoryLedgerId: bigint('inventory_ledger_id', { mode: 'number' })
    .references(() => inventoryLedger.id, { onDelete: 'set null' }),
  status: barcodeStatusEnum('status').notNull().default('PENDING_PRINT'),
  batchNumber: varchar('batch_number', { length: 100 }),
  mfgDate: timestamp('mfg_date'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  barcodeStringIdx: index('barcodes_barcode_string_idx').on(table.barcodeString),
  productVariantIdIdx: index('barcodes_product_variant_id_idx').on(table.productVariantId),
  statusIdx: index('barcodes_status_idx').on(table.status),
}));
