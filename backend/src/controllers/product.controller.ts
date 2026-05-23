import { Request, Response, NextFunction } from 'express';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(501).json({ message: 'Not Implemented' });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(501).json({ message: 'Not Implemented' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
