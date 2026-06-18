import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { purchases, purchaseItems, purchaseAdjustments } from '../db/schema';
import { eq } from 'drizzle-orm';

export class PurchaseController {
  static async createPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { supplierId, billingBranchId, receivingBranchId, billNumber, challanNumber, documentType, status, taxRuleId, totalBaseAmount, totalTaxAmount, totalDiscountAmount, netAmount, notes, items } = req.body;
      const createdBy = req.user?.id || 1; // Fallback

      const newPurchase = await db.transaction(async (tx) => {
        // 1. Create the purchase bill header
        const [purchase] = await tx.insert(purchases).values({
          supplierId,
          billingBranchId,
          receivingBranchId,
          billNumber,
          challanNumber,
          documentType: documentType || 'INVOICE',
          status: status || 'DRAFT',
          taxRuleId,
          totalBaseAmount,
          totalTaxAmount,
          totalDiscountAmount,
          netAmount,
          notes,
          createdBy,
        }).returning();

        // 2. Insert items
        if (items && items.length > 0) {
          const itemsToInsert = items.map((item: any) => ({
            purchaseId: purchase.id,
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: item.quantityReceived || item.quantityOrdered,
            unitCost: item.unitCost,
            discountPercentage: item.discountPercentage || 0,
            taxAmount: item.taxAmount || 0,
            netLineTotal: item.netLineTotal,
          }));
          await tx.insert(purchaseItems).values(itemsToInsert);
        }
        
        return purchase;
      });

      res.status(201).json({ success: true, data: newPurchase });
    } catch (error: any) {
      next(error);
    }
  }

  static async getPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real scenario, implement pagination and filtering here
      const allPurchases = await db.select().from(purchases);
      res.status(200).json({ success: true, data: allPurchases });
    } catch (error: any) {
      next(error);
    }
  }
}
