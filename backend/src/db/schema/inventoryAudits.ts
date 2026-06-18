import { pgTable, bigserial, varchar, bigint, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { locations } from './locations';
import { users } from './users';
import { auditStatusEnum } from './enums';
import { products } from './products';
import { productVariants } from './productVariants';

export const inventoryAudits = pgTable('inventory_audits', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  auditNo: varchar('audit_no', { length: 50 }).unique().notNull(),
  locationId: bigint('location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' })
    .notNull(),
  status: auditStatusEnum('status').notNull().default('IN_PROGRESS'),
  notes: varchar('notes', { length: 1000 }),
  createdByUserId: bigint('created_by_user_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  statusIdx: index('inventory_audits_status_idx').on(table.status),
  locationIdx: index('inventory_audits_location_idx').on(table.locationId),
}));

export const inventoryAuditItems = pgTable('inventory_audit_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  auditId: bigint('audit_id', { mode: 'number' })
    .references(() => inventoryAudits.id, { onDelete: 'cascade' })
    .notNull(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' }),
  expectedQty: integer('expected_qty').notNull(),
  countedQty: integer('counted_qty').notNull().default(0),
  variance: integer('variance').notNull().default(0),
});
