import { pgTable, bigserial, varchar, integer, timestamp, boolean, index, check, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { offerTypeEnum } from './enums';

export const offers = pgTable('offers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }),
  type: offerTypeEnum('type').notNull(),
  value: integer('value').notNull(), // cents if FLAT_AMOUNT, percentage (0-100) if PERCENTAGE
  minOrderValue: integer('min_order_value').notNull().default(0), // cents
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  applicableProducts: jsonb('applicable_products').$type<number[]>(),
  applicableCategories: jsonb('applicable_categories').$type<number[]>(),
  conditions: jsonb('conditions'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  valueCheck: check('offers_value_check', sql`${table.value} > 0`),
  minOrderCheck: check('offers_min_order_check', sql`${table.minOrderValue} >= 0`),
  codeIdx: index('offers_code_idx').on(table.code),
}));
