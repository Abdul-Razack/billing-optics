import { relations } from 'drizzle-orm';
import { users } from './users';
import { customers } from './customers';
import { prescriptions, prescriptionTests } from './prescriptions';
import { categories } from './categories';
import { products } from './products';
import { invoices } from './invoices';
import { invoiceItems } from './invoiceItems';
import { orders } from './orders';
import { orderItems } from './orderItems';
import { payments } from './payments';
import { inventoryLedger } from './inventoryLedger';
import { auditLogs } from './auditLogs';
import { vendors } from './vendors';
import { labJobs } from './labJobs';
import { posShortcuts } from './posShortcuts';
import { offers } from './offers';
import { patients } from './patients';
import { doctors } from './doctors';
import { purchaseItems } from './purchaseItems';
import { purchases } from './purchases';

export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
  prescriptions: many(prescriptions),
  inventoryLedger: many(inventoryLedger),
  auditLogs: many(auditLogs),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  orders: many(orders),
  prescriptions: many(prescriptions),
  patients: many(patients),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  customer: one(customers, {
    fields: [patients.customerId],
    references: [customers.id],
  }),
  prescriptions: many(prescriptions),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [prescriptions.customerId],
    references: [customers.id],
  }),
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [prescriptions.doctorId],
    references: [doctors.id],
  }),
  creator: one(users, {
    fields: [prescriptions.createdBy],
    references: [users.id],
  }),
  tests: many(prescriptionTests),
}));

export const prescriptionTestsRelations = relations(prescriptionTests, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionTests.prescriptionId],
    references: [prescriptions.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  invoiceItems: many(invoiceItems),
  orderItems: many(orderItems),
  inventoryLedger: many(inventoryLedger),
  posShortcuts: many(posShortcuts),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  createdBy: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [invoices.offerId],
    references: [offers.id],
  }),
  lines: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const inventoryLedgerRelations = relations(inventoryLedger, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLedger.productId],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [inventoryLedger.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const offersRelations = relations(offers, ({ many }) => ({
  invoices: many(invoices),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  labJobs: many(labJobs),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  createdBy: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [orders.offerId],
    references: [offers.id],
  }),
  lines: many(orderItems),
  payments: many(payments),
  labJob: one(labJobs, {
    fields: [orders.id],
    references: [labJobs.orderId],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  labJob: one(labJobs, {
    fields: [orderItems.id],
    references: [labJobs.orderItemId],
  }),
}));

export const labJobsRelations = relations(labJobs, ({ one }) => ({
  order: one(orders, {
    fields: [labJobs.orderId],
    references: [orders.id],
  }),
  // The specific lens line item on the order this lab job was created for
  orderItem: one(orderItems, {
    fields: [labJobs.orderItemId],
    references: [orderItems.id],
  }),
  // The patient's prescription that drove this lab order
  prescription: one(prescriptions, {
    fields: [labJobs.prescriptionId],
    references: [prescriptions.id],
  }),
  vendor: one(vendors, {
    fields: [labJobs.vendorId],
    references: [vendors.id],
  }),
}));

export const posShortcutsRelations = relations(posShortcuts, ({ one }) => ({
  product: one(products, {
    fields: [posShortcuts.productId],
    references: [products.id],
  }),
}));

