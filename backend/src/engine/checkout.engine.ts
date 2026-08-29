import { db } from '../config/db';
import { invoices, invoiceItems, payments, products, inventoryLedger, visitorLogs, orders, orderItems } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';
import { InventoryRepository } from '../repositories/inventory.repository';

export interface CheckoutDTO {
  action?: 'SAVE_AS_ORDER' | 'DIRECT_INVOICE';
  customerId?: number;
  createdBy: number;
  items: {
    productId: number;
    quantity: number;
    employeeName?: string;
    discountPercent?: number;
  }[];
  payments?: {
    method: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
    amount: number;
    reference?: string;
  }[];
  offerId?: number;
  manualDiscount?: number;
  loyaltyPointsRedeemed?: number;
  /** ISO date string for expected delivery/pickup */
  deliveryDate?: string;
  /** Staff member who made the sale */
  salespersonId?: number;
  /** Prescription linked to this invoice */
  prescriptionId?: number;
}

export const processCheckout = async (data: CheckoutDTO & { requestId?: string }) => {
  const isOrder = data.action === 'SAVE_AS_ORDER';

  // 0. Check idempotency BEFORE opening a transaction to avoid locking
  if (data.requestId) {
    if (isOrder) {
      const [existing] = await db.select().from(orders).where(eq(orders.requestId, data.requestId));
      if (existing) {
        return { success: true, recordId: existing.id, isOrder: true, idempotent: true };
      }
    } else {
      const [existing] = await db.select().from(invoices).where(eq(invoices.requestId, data.requestId));
      if (existing) {
        return { success: true, recordId: existing.id, isOrder: false, idempotent: true };
      }
    }
  }

  const checkoutResult = await db.transaction(async (tx) => {
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

      const itemBase = product.sellingPrice * item.quantity;
      const itemDiscPercent = Math.min(100, Math.max(0, item.discountPercent || 0));
      const itemDisc = Math.round(itemBase * itemDiscPercent / 100);
      const itemTotal = itemBase - itemDisc;
      const itemTax = Math.round((itemTotal * product.gstPercent) / 100);
      
      subtotal += itemBase;
      taxTotal += itemTax;

      const snapshotName = item.employeeName 
        ? `${product.name} (Emp: ${item.employeeName})`
        : product.name;

      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        snapshotName,
        snapshotSku: product.sku || '',
        snapshotPrice: product.sellingPrice,
        snapshotCostPrice: product.costPrice || 0,
        snapshotTaxPercent: product.gstPercent || 0,
        discountPercent: itemDiscPercent,
        lineTotal: itemTotal,
      });
      
      enrichedItems.push({
        productId: product.id,
        categoryId: product.categoryId,
        quantity: item.quantity,
        price: product.sellingPrice,
      });

      // Prepare ledger entry (Orders also deduct stock to reserve it)
      ledgerEntries.push({
        productId: item.productId,
        movementType: 'SALE',
        quantityChange: -item.quantity,
        referenceType: isOrder ? 'ORDER' : 'INVOICE',
        createdBy: data.createdBy,
        notes: isOrder ? `Stock reserved for pending order` : `Sale from checkout`,
      });
    }

    let discountTotal = 0;
    
    // Process automated offer if provided
    if (data.offerId) {
      const { OfferService } = require('../services/offer.service');
      const offerService = new OfferService();
      // Use subtotal after per-line discounts as the base for offer calculation
      const lineDiscountTotal = subtotal - enrichedItems.reduce((sum: number, ei: any) => sum + ei.price * ei.quantity, 0);
      const offerService2 = new OfferService();
      const offerResult = await offerService2.validateAndCalculateDiscount(data.offerId, subtotal, enrichedItems);
      discountTotal = offerResult.discountTotal;
    } else if (data.manualDiscount) {
      discountTotal = data.manualDiscount;
    }

    if (discountTotal > (subtotal + taxTotal)) {
      discountTotal = subtotal + taxTotal; // Discount cannot exceed total
    }

    let notesExtra = '';
    // Process Loyalty Points Redemption
    if (data.loyaltyPointsRedeemed && data.customerId) {
      const { customers } = require('../db/schema/customers');
      const [customer] = await tx.select().from(customers).where(eq(customers.id, data.customerId));
      
      if (!customer || customer.loyaltyPoints < data.loyaltyPointsRedeemed) {
        throw new ValidationError("Insufficient loyalty points");
      }
      
      // 1 point = ₹1 (100 paise)
      const pointsValueInPaise = data.loyaltyPointsRedeemed * 100;
      
      // We add this to the total discount
      discountTotal += pointsValueInPaise;
      
      // Deduct points from customer immediately
      await tx.update(customers)
        .set({ loyaltyPoints: sql`${customers.loyaltyPoints} - ${data.loyaltyPointsRedeemed}` })
        .where(eq(customers.id, data.customerId));
        
      notesExtra = ` (Redeemed ${data.loyaltyPointsRedeemed} pts)`;
    }

    if (discountTotal > (subtotal + taxTotal)) {
      discountTotal = subtotal + taxTotal;
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

    // Generate unique number avoiding collision
    const hex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0').toUpperCase();
    
    let createdRecordId: number;

    if (isOrder) {
      const orderNum = `ORD-${Date.now()}-${hex}`;
      const [newOrder] = await tx.insert(orders).values({
        requestId: data.requestId,
        orderNumber: orderNum,
        customerId: data.customerId,
        createdBy: data.createdBy,
        offerId: data.offerId || null,
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
        amountPaid: 0,
        status: 'PENDING',
        notes: notesExtra || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        salespersonId: data.salespersonId ?? null,
        prescriptionId: data.prescriptionId ?? null,
      }).returning();
      createdRecordId = newOrder.id;

      if (itemsToInsert.length > 0) {
        const itemsWithOrderId = itemsToInsert.map(i => ({ ...i, orderId: createdRecordId }));
        await tx.insert(orderItems).values(itemsWithOrderId);

        const ledgerWithRefId = ledgerEntries.map(l => ({ ...l, referenceId: createdRecordId }));
        await tx.insert(inventoryLedger).values(ledgerWithRefId);
      }

      if (data.payments && data.payments.length > 0) {
        const paymentsToInsert = data.payments.map(p => ({
          orderId: createdRecordId,
          amount: p.amount,
          paymentMethod: p.method,
          referenceNumber: p.reference,
        }));
        await tx.insert(payments).values(paymentsToInsert);
      }

      if (totalPaid > 0) {
        await tx.update(orders)
          .set({ amountPaid: totalPaid }) // Partial payments on orders don't have a specific payment status field, just amount paid. Wait, we should update amountPaid
          .where(eq(orders.id, createdRecordId));
      }

    } else {
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
        notes: notesExtra || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        salespersonId: data.salespersonId ?? null,
        prescriptionId: data.prescriptionId ?? null,
      }).returning();
      createdRecordId = newInvoice.id;

      // 3. Create items
      if (itemsToInsert.length > 0) {
        const itemsWithInvoiceId = itemsToInsert.map(i => ({ ...i, invoiceId: createdRecordId }));
        await tx.insert(invoiceItems).values(itemsWithInvoiceId);

        const ledgerWithRefId = ledgerEntries.map(l => ({ ...l, referenceId: createdRecordId }));
        await tx.insert(inventoryLedger).values(ledgerWithRefId);
      }

      // 4. Create payments
      if (data.payments && data.payments.length > 0) {
        const paymentsToInsert = data.payments.map(p => ({
          invoiceId: createdRecordId,
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
          .where(eq(invoices.id, createdRecordId));
      }
    }

    // 6. Loyalty Program & Referrals
    if (data.customerId && grandTotal > 0) {
      const { customers } = require('../db/schema/customers');
      
      const earnedPoints = Math.floor(grandTotal / 100);
      if (earnedPoints > 0) {
        await tx.update(customers)
          .set({ loyaltyPoints: sql`${customers.loyaltyPoints} + ${earnedPoints}` })
          .where(eq(customers.id, data.customerId));
      }

      // Check if first purchase for referral bonus
      const [invoiceCountRes] = await tx.select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(eq(invoices.customerId, data.customerId));
      
      if (Number(invoiceCountRes?.count) === 1) { // This is their first invoice
        const [customer] = await tx.select().from(customers).where(eq(customers.id, data.customerId));
        if (customer && customer.referredBy) {
          // Award 50 points to referrer
          await tx.update(customers)
            .set({ loyaltyPoints: sql`${customers.loyaltyPoints} + 50` })
            .where(eq(customers.id, customer.referredBy));
        }
      }
    }

    return { success: true, recordId: createdRecordId, isOrder };
  });

  // After the transaction commits: upsert today's visitor count (+1).
  // This runs OUTSIDE the transaction so a visitor-log failure never rolls back a sale.
  const todayISO = new Date().toISOString().split('T')[0];
  try {
    await db
      .insert(visitorLogs)
      .values({ logDate: todayISO, count: 1, notes: 'Auto: invoice created', createdBy: data.createdBy })
      .onConflictDoUpdate({
        target: visitorLogs.logDate,
        set: { count: sql`${visitorLogs.count} + 1` },
      });
  } catch {
    // Non-critical — never block a checkout because visitor log failed
  }

  return checkoutResult;
};
