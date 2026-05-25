import { Router } from 'express';
import { db } from '../config/db';
import { inventoryLedger } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/stock/:productId', authenticate, async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const result = await db
      .select({ total: sql<number>`sum(${inventoryLedger.quantityChange})` })
      .from(inventoryLedger)
      .where(eq(inventoryLedger.productId, productId));
      
    const availableQuantity = result[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        productId,
        availableQuantity,
        status: availableQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
