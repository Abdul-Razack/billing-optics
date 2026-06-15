import { Request, Response, NextFunction } from 'express';
import { vendorService } from '../services/vendor.service';
import { AuditService } from '../services/audit.service';

export class VendorController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await vendorService.create(data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_VENDOR',
        module: 'VENDOR',
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
      const isActive = req.query.isActive as boolean | undefined;

      const result = await vendorService.getAll({ search, page, limit, isActive });
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await vendorService.getById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      const original = await vendorService.getById(id).catch(() => null);
      const result = await vendorService.update(id, data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_VENDOR',
        module: 'VENDOR',
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
      const original = await vendorService.getById(id).catch(() => null);
      
      await vendorService.delete(id);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'DELETE_VENDOR',
        module: 'VENDOR',
        recordId: id.toString(),
        oldValues: original,
        newValues: null,
        req,
      });

      res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
