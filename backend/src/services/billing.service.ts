import { db } from '../config/db';
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

  async checkout(data: CheckoutDTO) {
    return await processCheckout(data);
  }

  async addPayment(invoiceId: number, amount: number, paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER', referenceNumber?: string) {
    return await db.transaction(async (tx: DbOrTx) => {
      const invoice = await BillingRepository.getInvoiceById(invoiceId, tx);
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
