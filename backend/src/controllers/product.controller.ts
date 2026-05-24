import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryIdStr = req.query.categoryId as string;
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;
      const result = await productService.getAllProducts(categoryId ? { categoryId } : undefined);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await productService.updateProduct(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await productService.updateProduct(id, { isActive: false });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
