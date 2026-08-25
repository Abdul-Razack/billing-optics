import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { purchases, purchaseItems, productVariants, stockBalances } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
      const allPurchases = await db.select().from(purchases);
      res.status(200).json({ success: true, data: allPurchases });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * POST /purchases/:purchaseId/lens-grid
   * Bulk-ingest an Rx Lens SPH×CYL grid.
   * Body: { productId, locationId, lensGrid: [{sph, cyl, qty, unitCost}] }
   *
   * For each non-zero-qty cell:
   * 1. Upsert a product_variant with {sph, cyl} in its JSONB attributes.
   * 2. Create a purchase_items row on the given purchase.
   * 3. Upsert stock_balances to increment the quantity at the given location.
   */
  static async bulkLensGridIngest(req: Request, res: Response, next: NextFunction) {
    try {
      const purchaseId = parseInt(req.params.purchaseId, 10);
      const { productId, locationId, lensGrid } = req.body as {
        productId: number;
        locationId: number;
        lensGrid: Array<{ sph: string; cyl: string; qty: number; unitCost: number }>;
      };

      if (!productId || !locationId || !Array.isArray(lensGrid) || lensGrid.length === 0) {
        res.status(400).json({ success: false, message: 'productId, locationId, and lensGrid[] are required.' });
        return;
      }

      // Filter out empty/zero cells
      const activeCells = lensGrid.filter(cell => cell.qty > 0);
      if (activeCells.length === 0) {
        res.status(400).json({ success: false, message: 'No cells with qty > 0 provided.' });
        return;
      }

      const results = await db.transaction(async (tx) => {
        const createdItems: any[] = [];

        for (const cell of activeCells) {
          const attrKey = { sph: cell.sph, cyl: cell.cyl };

          // 1. Upsert product_variant — find existing or create new
          let variant = await tx.query.productVariants.findFirst({
            where: and(
              eq(productVariants.productId, productId),
              sql`${productVariants.attributes}->>'sph' = ${cell.sph} AND ${productVariants.attributes}->>'cyl' = ${cell.cyl}`
            ),
          });

          if (!variant) {
            const [newVariant] = await tx.insert(productVariants).values({
              productId,
              attributes: attrKey,
              stockQuantity: 0, // managed via stock_balances
            }).returning();
            variant = newVariant;
          }

          // 2. Create purchase_items row
          const netLineTotal = cell.qty * cell.unitCost;
          const [purchaseItem] = await tx.insert(purchaseItems).values({
            purchaseId,
            productId,
            productVariantId: variant.id,
            quantityOrdered: cell.qty,
            quantityReceived: cell.qty,
            unitCost: cell.unitCost,
            netLineTotal,
          }).returning();
          createdItems.push(purchaseItem);

          // 3. Upsert stock_balances — increment qty at the given location
          const existing = await tx.query.stockBalances.findFirst({
            where: and(
              eq(stockBalances.productId, productId),
              eq(stockBalances.productVariantId, variant.id),
              eq(stockBalances.locationId, locationId)
            ),
          });

          if (existing) {
            await tx.update(stockBalances)
              .set({ quantity: existing.quantity + cell.qty })
              .where(eq(stockBalances.id, existing.id));
          } else {
            await tx.insert(stockBalances).values({
              productId,
              productVariantId: variant.id,
              locationId,
              quantity: cell.qty,
            });
          }
        }

        return createdItems;
      });

      res.status(201).json({
        success: true,
        data: results,
        message: `${results.length} lens grid cell(s) ingested successfully.`,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
