import { db } from '../config/db';
import { invoices, invoiceItems, payments, products, inventoryLedger } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';
import { InventoryRepository } from '../repositories/inventory.repository';

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
  offerId?: number;
  manualDiscount?: number;
}

export const processCheckout = async (data: CheckoutDTO & { requestId?: string }) => {
  // 0. Check idempotency BEFORE opening a transaction to avoid locking
  if (data.requestId) {
    const [existing] = await db.select().from(invoices).where(eq(invoices.requestId, data.requestId));
    if (existing) {
      return { success: true, invoiceId: existing.id, idempotent: true };
    }
  }

  return await db.transaction(async (tx) => {
    // 1. Calculate totals and deduct stock
    let subtotal = 0;
    let taxTotal = 0;
    const itemsToInsert = [];
    const ledgerEntries: any[] = [];
    const enrichedItems: any[] = [];

    for (const item of data.items) {
      const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!product) throw new NotFoundError(`Product ${item.productId} not found`);

      const inventoryRepo = new InventoryRepository();
      const currentStock = await inventoryRepo.getCurrentStock(item.productId, tx);
      if (currentStock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
      }

      const itemTotal = product.sellingPrice * item.quantity;
      const itemTax = Math.round((itemTotal * product.gstPercent) / 100);
      
      subtotal += itemTotal;
      taxTotal += itemTax;

      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        snapshotName: product.name,
        snapshotSku: product.sku || '',
        snapshotPrice: product.sellingPrice,
        snapshotCostPrice: product.costPrice || 0,
        snapshotTaxPercent: product.gstPercent || 0,
        lineTotal: itemTotal, // Subtotal for this line (cents)
      });
      
      enrichedItems.push({
        productId: product.id,
        categoryId: product.categoryId,
        quantity: item.quantity,
        price: product.sellingPrice,
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

    let discountTotal = 0;
    
    // Process automated offer if provided
    if (data.offerId) {
      const { OfferService } = require('../services/offer.service');
      const offerService = new OfferService();
      // Validates and throws if inactive/expired/below minimum
      const offerResult = await offerService.validateAndCalculateDiscount(data.offerId, subtotal, enrichedItems);
      discountTotal = offerResult.discountTotal;
    } else if (data.manualDiscount) {
      discountTotal = data.manualDiscount;
    }

    if (discountTotal > (subtotal + taxTotal)) {
      discountTotal = subtotal + taxTotal; // Discount cannot exceed total
    }

    const grandTotal = subtotal + taxTotal - discountTotal;

    // Validate payments
    let totalPaid = 0;
    if (data.payments && data.payments.length > 0) {
      data.payments.forEach(p => { totalPaid += p.amount; });
    }

    if (totalPaid > grandTotal) {
      throw new ValidationError(`Payment total (${totalPaid}) exceeds grand total (${grandTotal})`);
    }

    // Generate unique invoice number avoiding collision
    const hex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase();
    const invoiceNum = `INV-${Date.now()}-${hex}`;
    
    const [newInvoice] = await tx.insert(invoices).values({
      requestId: data.requestId,
      invoiceNumber: invoiceNum,
      customerId: data.customerId,
      createdBy: data.createdBy,
      offerId: data.offerId || null,
      subtotal,
      taxTotal,
      discountTotal,
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
    if (data.payments && data.payments.length > 0) {
      const paymentsToInsert = data.payments.map(p => ({
        invoiceId: newInvoice.id,
        amount: p.amount,
        paymentMethod: p.method,
        referenceNumber: p.reference,
      }));
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
