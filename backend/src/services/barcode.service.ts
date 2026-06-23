import { db } from '../config/db';
import crypto from 'crypto';
import { barcodes } from '../db/schema/barcodes';
import { eq, inArray } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export class BarcodeService {
  /**
   * Generates unique barcode strings and saves them to the database.
   * Standard format: BOS-[VariantId]-[RandomStr] to ensure uniqueness and readability
   */
  static async generateBarcodes(payload: { productVariantId: number, quantity: number, batchNumber?: string, mfgDate?: Date, expiryDate?: Date }) {
    if (payload.quantity <= 0 || payload.quantity > 5000) {
      throw new AppError(400, 'Quantity must be between 1 and 5000');
    }

    const newBarcodes = [];
    const timestamp = Date.now().toString().slice(-4); // last 4 digits of timestamp

    for (let i = 0; i < payload.quantity; i++) {
      // Industry format: e.g., BOS-15-8941-A2B9F
      const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      const barcodeString = `BOS-${payload.productVariantId}-${timestamp}-${randomStr}-${i}`;

      newBarcodes.push({
        barcodeString,
        productVariantId: payload.productVariantId,
        batchNumber: payload.batchNumber,
        mfgDate: payload.mfgDate,
        expiryDate: payload.expiryDate,
        status: 'PENDING_PRINT' as const,
      });
    }

    // Insert into DB
    const inserted = await db.insert(barcodes).values(newBarcodes).returning();
    return inserted;
  }

  /**
   * Marks a list of barcode IDs as printed (ACTIVE status)
   */
  static async markAsPrinted(barcodeIds: number[]) {
    if (!barcodeIds || barcodeIds.length === 0) return [];

    const updated = await db.update(barcodes)
      .set({ status: 'ACTIVE' })
      .where(inArray(barcodes.id, barcodeIds))
      .returning();

    return updated;
  }
}
