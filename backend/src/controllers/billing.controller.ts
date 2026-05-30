import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';
import { AuditService } from '../services/audit.service';
import { NotFoundError, ValidationError } from '../utils/errors';

const billingService = new BillingService();

export class BillingController {
  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.getInvoices(req.query);
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const cashierId = req.user!.id;
      const requestId = req.params.id; // From URL: /invoices/:id/checkout

      const payload = {
        ...req.body,
        requestId,
        createdBy: cashierId
      };
      const result = await billingService.checkout(payload);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_INVOICE',
        module: 'INVOICE',
        recordId: result.invoiceId.toString(),
        newValues: { invoiceId: result.invoiceId },
        req,
      });

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
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'ADD_PAYMENT',
        module: 'INVOICE',
        recordId: invoiceId.toString(),
        newValues: { paymentId: result.id, amount, paymentMethod },
        req,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateDeliveryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      const { deliveryStatus } = req.body;
      
      if (!['PENDING', 'READY', 'DELIVERED'].includes(deliveryStatus)) {
        throw new ValidationError('Invalid delivery status');
      }

      const original = await billingService.getInvoiceDetails(invoiceId).catch(() => null);
      const result = await billingService.updateDeliveryStatus(invoiceId, deliveryStatus as any);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_DELIVERY_STATUS',
        module: 'INVOICE',
        recordId: invoiceId.toString(),
        oldValues: { deliveryStatus: original?.deliveryStatus },
        newValues: { deliveryStatus: result?.deliveryStatus },
        req,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      const payload = {
        customerId: req.body.customerId,
        deliveryStatus: req.body.deliveryStatus,
        notes: req.body.notes,
      };

      const original = await billingService.getInvoiceDetails(invoiceId).catch(() => null);
      const result = await billingService.updateInvoiceMetadata(invoiceId, payload);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_INVOICE',
        module: 'INVOICE',
        recordId: invoiceId.toString(),
        oldValues: { customerId: original?.customerId, deliveryStatus: original?.deliveryStatus, notes: original?.notes },
        newValues: { customerId: result?.customerId, deliveryStatus: result?.deliveryStatus, notes: result?.notes },
        req,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async voidInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoiceId = parseInt(req.params.id, 10);
      const userId = req.user!.id;

      const original = await billingService.getInvoiceDetails(invoiceId).catch(() => null);
      const result = await billingService.voidInvoice(invoiceId, userId);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'VOID_INVOICE',
        module: 'INVOICE',
        recordId: invoiceId.toString(),
        oldValues: { status: original?.status },
        newValues: { status: result?.status },
        req,
      });

      res.status(200).json({ success: true, data: result });
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
        throw new ValidationError('Invalid invoice ID format');
      }

      const result = await billingService.getInvoiceDetails(invoiceId);
      if (!result) {
        throw new NotFoundError('Invoice not found');
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
        throw new ValidationError('Invalid invoice ID');
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
