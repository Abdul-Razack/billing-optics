import { pgTable, bigserial, varchar, boolean, timestamp, index, jsonb, integer, bigint } from 'drizzle-orm/pg-core';
import { genderEnum } from './enums';

export const customers = pgTable('customers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  gender: genderEnum('gender'),
  address: varchar('address', { length: 500 }),
  notes: varchar('notes', { length: 1000 }),
  customFields: jsonb('custom_fields').default('{}'),
  
  // CRM Features
  dateOfBirth: timestamp('date_of_birth', { mode: 'date' }),
  anniversaryDate: timestamp('anniversary_date', { mode: 'date' }),
  isDnd: boolean('is_dnd').notNull().default(false),
  labels: jsonb('labels').default('[]'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  referredBy: bigint('referred_by', { mode: 'number' }), // Self reference handled at app level to avoid circular issues

  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  phoneIdx: index('customers_phone_idx').on(table.phone),
}));
