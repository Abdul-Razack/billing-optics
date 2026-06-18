import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { visitorLogs } from '../db/schema/visitorLogs';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const createVisitorLogSchema = z.object({
  body: z.object({
    logDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    count: z.number().int().nonnegative(),
    notes: z.string().max(500).optional().or(z.literal('')),
  })
});

export class VisitorLogController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createVisitorLogSchema.parse(req);
      const data = parsed.body;

      const dateObj = new Date(data.logDate);
      const isoDateString = dateObj.toISOString().split('T')[0];

      // Check if a log already exists for this date, if so update it
      const existing = await db.select().from(visitorLogs).where(eq(visitorLogs.logDate, isoDateString));

      let result;
      if (existing.length > 0) {
        const [updated] = await db.update(visitorLogs)
          .set({ count: data.count, notes: data.notes })
          .where(eq(visitorLogs.id, existing[0].id))
          .returning();
        result = updated;
      } else {
        const [inserted] = await db.insert(visitorLogs)
          .values({
            logDate: isoDateString,
            count: data.count,
            notes: data.notes,
            createdBy: req.user?.id,
          })
          .returning();
        result = inserted;
      }

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await db.select().from(visitorLogs).orderBy(desc(visitorLogs.logDate)).limit(365);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

      const { count, notes } = req.body;
      if (typeof count !== 'number' || count < 0) {
        return res.status(400).json({ success: false, message: 'count must be a non-negative number' });
      }

      const [updated] = await db
        .update(visitorLogs)
        .set({ count, notes: notes ?? null })
        .where(eq(visitorLogs.id, id))
        .returning();

      if (!updated) return res.status(404).json({ success: false, message: 'Log not found' });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

      const deleted = await db.delete(visitorLogs).where(eq(visitorLogs.id, id)).returning();
      if (deleted.length === 0) return res.status(404).json({ success: false, message: 'Log not found' });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
