import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { barcodes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BarcodeService } from '../services/barcode.service';

export class BarcodeController {
  static async getBarcodes(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      
      let query = db.select().from(barcodes);
      
      if (status) {
        query = query.where(eq(barcodes.status, status as any)) as any;
      }

      const allBarcodes = await query;
      res.status(200).json({ success: true, data: allBarcodes });
    } catch (error: any) {
      next(error);
    }
  }

  static async generateBarcodes(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate in route validator ideally, but we'll extract directly here
      const { productVariantId, quantity, batchNumber, mfgDate, expiryDate } = req.body;
      const data = await BarcodeService.generateBarcodes({
        productVariantId,
        quantity,
        batchNumber,
        mfgDate: mfgDate ? new Date(mfgDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });
      res.status(201).json({ success: true, data, message: `${quantity} barcodes generated successfully.` });
    } catch (error: any) {
      next(error);
    }
  }

  static async markAsPrinted(req: Request, res: Response, next: NextFunction) {
    try {
      const { barcodeIds } = req.body;
      if (!Array.isArray(barcodeIds)) {
        return res.status(400).json({ success: false, message: 'barcodeIds array is required' });
      }
      const data = await BarcodeService.markAsPrinted(barcodeIds);
      res.status(200).json({ success: true, data, message: 'Barcodes marked as ACTIVE.' });
    } catch (error: any) {
      next(error);
    }
  }
}
