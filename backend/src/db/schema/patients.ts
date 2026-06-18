import { pgTable, bigserial, bigint, varchar, timestamp, boolean, date } from 'drizzle-orm/pg-core';
import { customers } from './customers';

export const patients = pgTable('patients', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  customerId: bigint('customer_id', { mode: 'number' })
    .references(() => customers.id, { onDelete: 'cascade' }), // Optional: a patient might not be linked to a billing customer initially
  name: varchar('name', { length: 255 }).notNull(),
  mobile: varchar('mobile', { length: 20 }),
  email: varchar('email', { length: 255 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 20 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
});
