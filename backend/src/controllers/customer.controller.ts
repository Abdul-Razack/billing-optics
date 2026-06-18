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
      // isActive is already coerced to boolean by the Zod validator
      const isActive = req.query.isActive as boolean | undefined;

      const result = await customerService.getAll({ search, page, limit, isActive });
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

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const original = await customerService.getById(id, false).catch(() => null);
      
      await customerService.delete(id);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'DELETE_CUSTOMER',
        module: 'CUSTOMER',
        recordId: id.toString(),
        oldValues: original,
        newValues: null,
        req,
      });

      res.status(200).json({ success: true, message: 'Customer deleted successfully' });
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

  static async getBirthdays(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : new Date().getMonth() + 1;
      const result = await customerService.getBirthdays(month);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAnniversaries(req: Request, res: Response, next: NextFunction) {
    try {
      const month = parseInt(req.query.month as string, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: 'Invalid month parameter' });
      }
      const data = await customerService.getAnniversaries(month);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getTopReferrers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const data = await customerService.getTopReferrers(limit);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getLoyaltyLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await customerService.getLoyaltyLeaderboard(limit);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
