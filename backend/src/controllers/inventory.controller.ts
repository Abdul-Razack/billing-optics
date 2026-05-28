import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { InventoryHistoryQuery } from '../repositories/inventory.repository';

export class InventoryController {
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const query: InventoryHistoryQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        movementType: req.query.movementType as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        createdBy: req.query.createdBy ? parseInt(req.query.createdBy as string, 10) : undefined,
        sort: (req.query.sort as 'newest' | 'oldest') || 'newest',
      };

      const result = await inventoryService.getHistory(query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await inventoryService.adjustStock(req.body, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('Insufficient stock') || error.message.includes('Product not found') || error.message.includes('Quantity must be non-zero')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  static async bulkAdjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const result = await inventoryService.bulkAdjustStock(req.body, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('Insufficient stock') || error.message.includes('Product with ID') || error.message.includes('Quantity must be non-zero')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
