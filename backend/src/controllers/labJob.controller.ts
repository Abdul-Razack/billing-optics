import { Request, Response, NextFunction } from 'express';
import { labJobService } from '../services/labJob.service';
import { AuditService } from '../services/audit.service';

export class LabJobController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await labJobService.create(data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_LAB_JOB',
        module: 'LAB_JOB',
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
      const status = req.query.status as string | undefined;
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string, 10) : undefined;
      const orderId = req.query.orderId ? parseInt(req.query.orderId as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await labJobService.getAll({ search, status, vendorId, orderId, page, limit });
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await labJobService.getById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      const original = await labJobService.getById(id).catch(() => null);
      const result = await labJobService.update(id, data);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_LAB_JOB',
        module: 'LAB_JOB',
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
      const original = await labJobService.getById(id).catch(() => null);
      
      await labJobService.delete(id);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'DELETE_LAB_JOB',
        module: 'LAB_JOB',
        recordId: id.toString(),
        oldValues: original,
        newValues: null,
        req,
      });

      res.status(200).json({ success: true, message: 'Lab Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
