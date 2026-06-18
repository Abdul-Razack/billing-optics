import { Request, Response, NextFunction } from 'express';
import { salesReturnService } from '../services/salesReturn.service';
import { AuditService } from '../services/audit.service';

export class SalesReturnController {
  static async processReturn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) throw new Error("Unauthorized");
      
      const returnData = {
        ...req.body,
        processedBy: req.user.id
      };

      const result = await salesReturnService.processReturn(returnData);
      
      await AuditService.logEvent({
        userId: req.user.id,
        action: 'CREATE_RETURN',
        module: 'INVOICE',
        recordId: result.id.toString(),
        newValues: result,
        req,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAllReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await salesReturnService.getAllReturns();
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
