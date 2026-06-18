import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { productAttributeDefinitions, productAttributeOptions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class ProductAttributeController {
  
  // 1. Get all attribute definitions for a category (and their options)
  static async getAttributesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = parseInt(req.params.categoryId, 10);
      
      const definitions = await db.select()
        .from(productAttributeDefinitions)
        .where(eq(productAttributeDefinitions.categoryId, categoryId))
        .orderBy(productAttributeDefinitions.displayOrder);

      // We need to fetch the options for SELECT types
      const definitionsWithOptions = await Promise.all(definitions.map(async (def) => {
        if (def.inputType === 'SELECT') {
          const options = await db.select()
            .from(productAttributeOptions)
            .where(
              and(
                eq(productAttributeOptions.attributeDefinitionId, def.id),
                eq(productAttributeOptions.isActive, true)
              )
            );
          return { ...def, options };
        }
        return { ...def, options: [] };
      }));

      res.status(200).json({ success: true, data: definitionsWithOptions });
    } catch (error: any) {
      next(error);
    }
  }

  // 2. Add a new attribute definition to a category
  static async createAttributeDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, name, label, inputType, isRequired, displayOrder } = req.body;
      
      const [newDef] = await db.insert(productAttributeDefinitions).values({
        categoryId,
        name,
        label,
        inputType: inputType || 'SELECT',
        isRequired: isRequired || false,
        displayOrder: displayOrder || 0,
      }).returning();

      res.status(201).json({ success: true, data: newDef });
    } catch (error: any) {
      next(error);
    }
  }

  // 3. Add a new option to a SELECT attribute (Inline Creation)
  static async createAttributeOption(req: Request, res: Response, next: NextFunction) {
    try {
      const definitionId = parseInt(req.params.id, 10);
      const { value } = req.body;

      const [newOption] = await db.insert(productAttributeOptions).values({
        attributeDefinitionId: definitionId,
        value,
      }).returning();

      res.status(201).json({ success: true, data: newOption });
    } catch (error: any) {
      next(error);
    }
  }

  // 4. Delete an attribute definition
  static async deleteAttributeDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const definitionId = parseInt(req.params.id, 10);
      await db.delete(productAttributeDefinitions)
        .where(eq(productAttributeDefinitions.id, definitionId));
      res.status(200).json({ success: true });
    } catch (error: any) {
      next(error);
    }
  }
}
