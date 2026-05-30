import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { AuditService } from '../services/audit.service';

const customerService = new CustomerService() as any;

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await customerService.create(data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_CUSTOMER',
        module: 'CUSTOMER',
        recordId: result.id.toString(),
        newValues: result,
        req,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      
      const result = await customerService.getAll({ search, page, limit });
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const includePrescriptions = req.query.includePrescriptions === 'true';
      const result = await customerService.getById(id, includePrescriptions);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      const original = await customerService.getById(id, false).catch(() => null);
      const result = await customerService.update(id, data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_CUSTOMER',
        module: 'CUSTOMER',
        recordId: id.toString(),
        oldValues: original,
        newValues: result,
        req,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async addPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.id, 10);
      const userId = req.user!.id;
      const data = { ...req.body, createdBy: userId };
      const result = await customerService.addPrescription(customerId, data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_PRESCRIPTION',
        module: 'PRESCRIPTION',
        recordId: result.id.toString(),
        newValues: result,
        req,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
