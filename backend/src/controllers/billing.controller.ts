import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';

const billingService = new BillingService();

export class BillingController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const cashierId = req.user!.id;
      const payload = {
        ...req.body,
        createdBy: cashierId
      };
      const result = await billingService.checkout(payload);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async addPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      const { amount, paymentMethod, referenceNumber } = req.body;
      const result = await billingService.addPayment(invoiceId, amount, paymentMethod, referenceNumber);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      const result = await billingService.getInvoiceDetails(invoiceId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
