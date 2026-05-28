import { pgTable, bigserial, varchar, timestamp, check, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const settings = pgTable('settings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  address: varchar('address', { length: 500 }),
  gstNumber: varchar('gst_number', { length: 50 }),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Asia/Kolkata'),
  customFieldDefinitions: jsonb('custom_field_definitions').default('{"products": [], "customers": []}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  singleRowCheck: check('settings_single_row_check', sql`${table.id} = 1`),
}));
