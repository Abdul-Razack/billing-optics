import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';

const billingService = new BillingService();

export class BillingController {
  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.getInvoices(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

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
      const invoiceIdParam = req.params.id;
      console.log('Fetching invoice:', invoiceIdParam);

      const invoiceId = parseInt(invoiceIdParam, 10);
      
      if (isNaN(invoiceId)) {
        // Return default draft invoice for string IDs like INV-001
        res.status(200).json({ 
          success: true,
          data: {
            id: invoiceIdParam,
            items: [],
            grandTotal: 0
          }
        });
        return;
      }

      const result = await billingService.getInvoiceDetails(invoiceId);
      if (!result) {
        res.status(404).json({ success: false, message: 'Invoice not found' });
        return;
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async exportInvoicePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceIdParam = req.params.id;
      const invoiceId = parseInt(invoiceIdParam, 10);
      
      if (isNaN(invoiceId)) {
        res.status(400).json({ success: false, message: 'Invalid invoice ID' });
        return;
      }

      const pdfBuffer = await billingService.generateInvoicePdf(invoiceId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
