import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/location.service';

export class LocationController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.create(req.body);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      
      const locations = await locationService.getAll(filters);
      res.status(200).json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.getById(parseInt(req.params.id, 10));
      res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.update(parseInt(req.params.id, 10), req.body);
      res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.delete(parseInt(req.params.id, 10));
      res.status(200).json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
