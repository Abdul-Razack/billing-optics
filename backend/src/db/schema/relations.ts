import { relations } from 'drizzle-orm';
import { users } from './users';
import { customers } from './customers';
import { prescriptions } from './prescriptions';
import { categories } from './categories';
import { products } from './products';
import { invoices } from './invoices';
import { invoiceItems } from './invoiceItems';
import { payments } from './payments';
import { inventoryLedger } from './inventoryLedger';
import { auditLogs } from './auditLogs';
import { vendors } from './vendors';
import { labJobs } from './labJobs';
import { posShortcuts } from './posShortcuts';
import { offers } from './offers';

export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
  prescriptions: many(prescriptions),
  inventoryLedger: many(inventoryLedger),
  auditLogs: many(auditLogs),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  customer: one(customers, {
    fields: [prescriptions.customerId],
    references: [customers.id],
  }),
  creator: one(users, {
    fields: [prescriptions.createdBy],
    references: [users.id],
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
  labJob: one(labJobs, {
    fields: [invoices.id],
    references: [labJobs.invoiceId],
  }),
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

export const labJobsRelations = relations(labJobs, ({ one }) => ({
  invoice: one(invoices, {
    fields: [labJobs.invoiceId],
    references: [invoices.id],
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

