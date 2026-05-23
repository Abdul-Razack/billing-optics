import { pgTable, bigserial, bigint, varchar, integer, numeric, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { customers } from './customers';
import { users } from './users';

export const prescriptions = pgTable('prescriptions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  customerId: bigint('customer_id', { mode: 'number' })
    .references(() => customers.id, { onDelete: 'restrict' })
    .notNull(),
  rightEyeSph: numeric('right_eye_sph', { precision: 5, scale: 2 }),
  rightEyeCyl: numeric('right_eye_cyl', { precision: 5, scale: 2 }),
  rightEyeAxis: integer('right_eye_axis'),
  leftEyeSph: numeric('left_eye_sph', { precision: 5, scale: 2 }),
  leftEyeCyl: numeric('left_eye_cyl', { precision: 5, scale: 2 }),
  leftEyeAxis: integer('left_eye_axis'),
  addPower: numeric('add_power', { precision: 5, scale: 2 }),
  pd: numeric('pd', { precision: 5, scale: 2 }),
  notes: varchar('notes', { length: 1000 }),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  rightEyeAxisCheck: check('right_eye_axis_check', sql`${table.rightEyeAxis} BETWEEN 1 AND 180`),
  leftEyeAxisCheck: check('left_eye_axis_check', sql`${table.leftEyeAxis} BETWEEN 1 AND 180`),
  customerIdIdx: index('prescriptions_customer_id_idx').on(table.customerId),
}));
