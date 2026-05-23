import { pgTable, bigserial, bigint, varchar, integer, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { invoices } from './invoices';
import { products } from './products';

export const invoiceItems = pgTable('invoice_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' })
    .notNull(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  snapshotName: varchar('snapshot_name', { length: 255 }).notNull(),
  snapshotSku: varchar('snapshot_sku', { length: 100 }).notNull(),
  snapshotPrice: integer('snapshot_price').notNull(),
  snapshotCostPrice: integer('snapshot_cost_price').notNull().default(0),
  snapshotTaxPercent: integer('snapshot_tax_percent').notNull(),
  quantity: integer('quantity').notNull().default(1),
  lineTotal: integer('line_total').notNull(),
}, (table) => ({
  snapshotPriceCheck: check('snapshot_price_check', sql`${table.snapshotPrice} >= 0`),
  snapshotCostPriceCheck: check('snapshot_cost_price_check', sql`${table.snapshotCostPrice} >= 0`),
  snapshotTaxPercentCheck: check('snapshot_tax_percent_check', sql`${table.snapshotTaxPercent} BETWEEN 0 AND 100`),
  quantityCheck: check('quantity_check', sql`${table.quantity} > 0`),
  lineTotalCheck: check('line_total_check', sql`${table.lineTotal} >= 0`),
  invoiceIdIdx: index('invoice_items_invoice_id_idx').on(table.invoiceId),
  productIdIdx: index('invoice_items_product_id_idx').on(table.productId),
}));
