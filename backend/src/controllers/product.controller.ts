import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { AuditService } from '../services/audit.service';

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

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await productService.getProductById(id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.createProduct(req.body);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'CREATE_PRODUCT',
        module: 'PRODUCT',
        recordId: result.id.toString(),
        newValues: result,
        req,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const original = await productService.getAllProducts({ search: id.toString() }).then(res => res.data.find(p => p.id === id) || null).catch(() => null);
      const result = await productService.updateProduct(id, req.body);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'UPDATE_PRODUCT',
        module: 'PRODUCT',
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
      const original = await productService.getProductById(id);
      
      const deletedSuffix = `_DEL_${Date.now()}`;
      const maxLen = 100 - deletedSuffix.length;
      const newSku = original.sku ? `${original.sku.slice(0, maxLen)}${deletedSuffix}` : undefined;
      const newBarcode = original.barcode ? `${original.barcode.slice(0, maxLen)}${deletedSuffix}` : undefined;

      const updateData: any = { isDeleted: true };
      if (newSku) updateData.sku = newSku;
      if (newBarcode) updateData.barcode = newBarcode;

      const result = await productService.updateProduct(id, updateData);
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'DELETE_PRODUCT',
        module: 'PRODUCT',
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
}
