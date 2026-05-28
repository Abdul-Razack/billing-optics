import { pgTable, bigserial, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { roleEnum } from './enums';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('CASHIER'),
  preferences: jsonb('preferences').default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
