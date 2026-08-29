import { pgTable, serial, integer, varchar, bigint, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { orders } from './orders';
import { products } from './products';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: bigint('order_id', { mode: 'number' })
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  /** A snapshot of the product name at the time of sale */
  snapshotName: varchar('snapshot_name', { length: 255 }).notNull(),
  snapshotSku: varchar('snapshot_sku', { length: 100 }),
  snapshotPrice: integer('snapshot_price').notNull(),
  snapshotCostPrice: integer('snapshot_cost_price').notNull().default(0),
  snapshotTaxPercent: integer('snapshot_tax_percent').notNull(),
  quantity: integer('quantity').notNull().default(1),
  discountPercent: integer('discount_percent').notNull().default(0),
  lineTotal: integer('line_total').notNull(),
  
  /** Only set for Lens category line items */
  lensPowerEye: varchar('lens_power_eye', { length: 10 }),
  lensPowerSph: varchar('lens_power_sph', { length: 10 }),
  lensPowerCyl: varchar('lens_power_cyl', { length: 10 }),
  lensPowerAxis: integer('lens_power_axis'),
  lensPowerAdd: varchar('lens_power_add', { length: 10 }),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  quantityCheck: check('order_items_quantity_check', sql`${table.quantity} > 0`),
  lineTotalCheck: check('order_items_line_total_check', sql`${table.lineTotal} >= 0`),
}));
