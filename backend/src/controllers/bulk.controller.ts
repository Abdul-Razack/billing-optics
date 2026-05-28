import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { products, categories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { parse } from 'csv-parse';
import * as fs from 'fs';

import { ValidationError, AppError } from '../utils/errors';

export class BulkController {
  static async uploadProducts(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return next(new ValidationError('No CSV file provided'));
    }

    try {
      const results: any[] = [];
      const parser = fs.createReadStream(req.file.path).pipe(
        parse({ columns: true, skip_empty_lines: true, trim: true })
      );

      for await (const row of parser) {
        results.push(row);
      }

      // Cleanup uploaded temp file
      fs.unlinkSync(req.file.path);

      let imported = 0;
      let skipped = 0;
      let errors = [];

      // Pre-fetch categories mapping (name -> id)
      const allCategories = await db.select().from(categories);
      const categoryMap = new Map(allCategories.map(c => [c.name.toLowerCase(), c.id]));

      // Pre-fetch all SKUs for fast duplicate checking
      const allProducts = await db.select({ sku: products.sku }).from(products);
      const existingSkus = new Set(allProducts.map(p => p.sku));

      for (const [index, row] of results.entries()) {
        try {
          const sku = row.sku || row.SKU;
          if (!sku) {
            errors.push(`Row ${index + 1}: Missing SKU`);
            skipped++;
            continue;
          }

          if (existingSkus.has(sku)) {
            skipped++; // We decided to skip duplicates
            continue;
          }

          const name = row.name || row.Name;
          if (!name) {
            errors.push(`Row ${index + 1}: Missing Name for SKU ${sku}`);
            skipped++;
            continue;
          }

          // Category resolution
          let categoryId = null;
          const catName = row.category || row.Category;
          if (catName) {
            const catLower = catName.toLowerCase();
            if (categoryMap.has(catLower)) {
              categoryId = categoryMap.get(catLower);
            } else {
              // Create category on the fly if it doesn't exist
              const [newCat] = await db.insert(categories).values({ name: catName }).returning({ id: categories.id });
              categoryMap.set(catLower, newCat.id);
              categoryId = newCat.id;
            }
          }

          if (!categoryId) {
            errors.push(`Row ${index + 1}: Missing Category for SKU ${sku}`);
            skipped++;
            continue;
          }

          const costPrice = parseInt(row.costPrice || row['Cost Price']) || 0;
          const sellingPrice = parseInt(row.sellingPrice || row['Selling Price']) || 0;
          const minStockAlert = parseInt(row.minStockAlert || row['Min Stock Alert']) || 5;

          // Process custom attributes
          const standardFields = ['name', 'Name', 'sku', 'SKU', 'category', 'Category', 'costPrice', 'Cost Price', 'sellingPrice', 'Selling Price', 'minStockAlert', 'Min Stock Alert'];
          const attributes: Record<string, any> = {};
          
          for (const key of Object.keys(row)) {
            if (!standardFields.includes(key) && row[key]) {
              attributes[key] = row[key];
            }
          }

          await db.insert(products).values({
            sku,
            name,
            categoryId,
            costPrice: costPrice * 100, // Assuming CSV has rupees, DB stores paise
            sellingPrice: sellingPrice * 100,
            minStockAlert,
            attributes
          });

          existingSkus.add(sku);
          imported++;
        } catch (e: any) {
          errors.push(`Row ${index + 1}: ${e.message}`);
          skipped++;
        }
      }

      return res.json({
        success: true,
        data: {
          imported,
          skipped,
          errors
        }
      });
    } catch (error: any) {
      console.error('CSV Processing Error:', error);
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return next(new AppError(500, 'Failed to process CSV file', error.message));
    }
  }
}
