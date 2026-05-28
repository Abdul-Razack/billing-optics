import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryIdStr = req.query.categoryId as string;
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;
      
      const result = await productService.getAllProducts({
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { search } : {}),
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {})
      });
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
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
