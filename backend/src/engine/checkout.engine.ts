import { db } from '../config/db';
import { invoices, invoiceItems, payments, products, inventoryLedger } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export interface CheckoutDTO {
  customerId?: number;
  createdBy: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  payments?: {
    method: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
    amount: number;
    reference?: string;
  }[];
}

export const processCheckout = async (data: CheckoutDTO) => {
  return await db.transaction(async (tx) => {
    // 1. Calculate totals and deduct stock
    let subtotal = 0;
    const itemsToInsert = [];
    const ledgerEntries: any[] = [];

    for (const item of data.items) {
      const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!product) throw new AppError(404, `Product ${item.productId} not found`);

      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;

      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        snapshotName: product.name,
        snapshotSku: product.sku || '',
        snapshotPrice: product.sellingPrice,
        snapshotCostPrice: product.costPrice || 0,
        snapshotTaxPercent: product.gstPercent || 0,
        lineTotal: itemTotal,
      });

      // Prepare ledger entry
      ledgerEntries.push({
        productId: item.productId,
        movementType: 'SALE',
        quantityChange: -item.quantity,
        referenceType: 'INVOICE',
        createdBy: data.createdBy,
        notes: `Sale from checkout`,
      });
    }

    const grandTotal = subtotal; // Ignoring tax/discount for simplicity in this draft

    const invoiceNum = `INV-${Date.now()}`;
    
    const [newInvoice] = await tx.insert(invoices).values({
      invoiceNumber: invoiceNum,
      customerId: data.customerId,
      createdBy: data.createdBy,
      subtotal,
      grandTotal,
      amountPaid: 0,
      paymentStatus: 'UNPAID',
    }).returning();

    // 3. Create items
    if (itemsToInsert.length > 0) {
      const itemsWithInvoiceId = itemsToInsert.map(i => ({ ...i, invoiceId: newInvoice.id }));
      await tx.insert(invoiceItems).values(itemsWithInvoiceId);

      const ledgerWithRefId = ledgerEntries.map(l => ({ ...l, referenceId: newInvoice.id }));
      await tx.insert(inventoryLedger).values(ledgerWithRefId);
    }

    // 4. Create payments
    let totalPaid = 0;
    if (data.payments && data.payments.length > 0) {
      const paymentsToInsert = data.payments.map(p => {
        totalPaid += p.amount;
        return {
          invoiceId: newInvoice.id,
          amount: p.amount,
          paymentMethod: p.method,
          referenceNumber: p.reference,
        };
      });
      await tx.insert(payments).values(paymentsToInsert);
    }

    // 5. Update invoice payment status
    let paymentStatus = 'UNPAID';
    if (totalPaid >= grandTotal) paymentStatus = 'PAID';
    else if (totalPaid > 0) paymentStatus = 'PARTIAL';

    if (totalPaid > 0) {
      await tx.update(invoices)
        .set({ amountPaid: totalPaid, paymentStatus: paymentStatus as any })
        .where(eq(invoices.id, newInvoice.id));
    }

    return { success: true, invoiceId: newInvoice.id };
  });
};
