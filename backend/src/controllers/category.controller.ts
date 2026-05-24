import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAll();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await categoryService.delete(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
