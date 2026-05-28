import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export class UserController {
  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const result = await db
        .select({
          preferences: users.preferences,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!result.length) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({ success: true, data: result[0].preferences });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { preferences } = req.body;
      if (!preferences || typeof preferences !== 'object') {
        throw new AppError(400, 'Invalid preferences payload');
      }

      const result = await db
        .update(users)
        .set({
          preferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
          preferences: users.preferences,
        });

      if (!result.length) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({ success: true, data: result[0].preferences });
    } catch (error) {
      next(error);
    }
  }
}
