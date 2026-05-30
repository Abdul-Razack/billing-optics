import { db } from '../config/db';
import { invoices } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BillingRepository } from '../repositories/billing.repository';
import { processCheckout, CheckoutDTO } from '../engine/checkout.engine';
import { NotFoundError, ValidationError } from '../utils/errors';
import { DbOrTx } from '../types/db';

import { SettingsRepository } from '../repositories/settings.repository';
import { generateInvoicePdf } from '../utils/pdf.util';

export class BillingService {
  async getInvoices(params: any) {
    return await BillingRepository.getInvoices(params);
  }

  async updateDeliveryStatus(invoiceId: number, deliveryStatus: 'PENDING' | 'READY' | 'DELIVERED') {
    const invoice = await BillingRepository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
    }
    
    await BillingRepository.updateInvoiceDeliveryStatus(invoiceId, deliveryStatus);
    return await BillingRepository.getInvoiceById(invoiceId);
  }

  async updateInvoiceMetadata(invoiceId: number, payload: { customerId?: number; deliveryStatus?: 'PENDING' | 'READY' | 'DELIVERED'; notes?: string }) {
    const invoice = await BillingRepository.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
    }
    
    await BillingRepository.updateInvoiceMetadata(invoiceId, payload);
    return await BillingRepository.getInvoiceWithItemsAndPayments(invoiceId);
  }

  async voidInvoice(invoiceId: number, userId: number) {
    return await db.transaction(async (tx: DbOrTx) => {
      const invoice = await BillingRepository.getInvoiceWithItemsAndPayments(invoiceId, tx);
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      if (invoice.paymentStatus === 'REFUNDED' || (invoice.notes && invoice.notes.includes('[VOIDED]'))) {
        throw new ValidationError(`Invoice ${invoiceId} is already voided.`);
      }

      // Add RETURN ledger entries for all products
      if (invoice.lines && invoice.lines.length > 0) {
        const { inventoryLedger } = require('../db/schema/inventoryLedger');
        const ledgerEntries = invoice.lines.map((item: any) => ({
          productId: item.productId,
          movementType: 'RETURN' as const,
          quantityChange: item.quantity,
          referenceType: 'INVOICE' as const,
          referenceId: invoiceId,
          notes: 'Restored from voided invoice',
          createdBy: userId,
        }));
        await tx.insert(inventoryLedger).values(ledgerEntries);
      }

      const newNotes = `[VOIDED] ${invoice.notes || ''}`.trim();
      await BillingRepository.updateInvoiceForVoid(invoiceId, newNotes, 'REFUNDED', tx);

      return await BillingRepository.getInvoiceWithItemsAndPayments(invoiceId, tx);
    });
  }

  async checkout(data: CheckoutDTO) {
    return await processCheckout(data);
  }

  async addPayment(invoiceId: number, amount: number, paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER', referenceNumber?: string) {
    return await db.transaction(async (tx: DbOrTx) => {
      // Use FOR UPDATE to prevent race conditions during concurrent payments
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, invoiceId)).for('update');
      
      if (!invoice) {
        throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
      }

      const grandTotal = Number(invoice.grandTotal);
      const amountPaid = Number(invoice.amountPaid || 0);
      const remainingBalance = grandTotal - amountPaid;

      if (amount > remainingBalance) {
        throw new ValidationError(`Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`);
      }

      await BillingRepository.createPayment({
        invoiceId,
        amount,
        paymentMethod,
        referenceNumber,
      }, tx);

      const newAmountPaid = amountPaid + amount;
      let newPaymentStatus = invoice.paymentStatus;
      
      if (newAmountPaid >= grandTotal) {
        newPaymentStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newPaymentStatus = 'PARTIAL';
      }

      await BillingRepository.updateInvoicePaymentStatus(
        invoiceId,
        newAmountPaid,
        newPaymentStatus,
        tx
      );

      return await BillingRepository.getInvoiceById(invoiceId, tx);
    });
  }

  async getInvoiceDetails(invoiceId: number) {
    return await BillingRepository.getInvoiceWithItemsAndPayments(invoiceId);
  }

  async generateInvoicePdf(invoiceId: number): Promise<Buffer> {
    const invoice = await BillingRepository.getInvoiceWithItemsAndPayments(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${invoiceId} not found`);
    }
    
    const settingsRepo = new SettingsRepository();
    const settings = await settingsRepo.getSettings();

    return await generateInvoicePdf(invoice, settings);
  }
}
