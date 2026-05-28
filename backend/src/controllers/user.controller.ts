import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError, UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { userService } from '../services/user.service';

export class UserController {
  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const result = await db
        .select({
          preferences: users.preferences,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!result.length) {
        throw new NotFoundError('User not found');
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
        throw new UnauthorizedError();
      }

      const { preferences } = req.body;
      if (!preferences || typeof preferences !== 'object') {
        throw new ValidationError('Invalid preferences payload');
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
        throw new NotFoundError('User not found');
      }

      res.status(200).json({ success: true, data: result[0].preferences });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        role: req.query.role as string | undefined,
        isActive: req.query.isActive as string | undefined,
      };

      const result = await userService.getAllUsers(query);
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await userService.getUserById(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Prevent users from changing their own role to prevent lockout or escalation
      if (req.user?.id === id && req.body.role) {
        throw new ForbiddenError('You cannot modify your own role');
      }

      // Prevent users from deactivating themselves
      if (req.user?.id === id && req.body.isActive === false) {
        throw new ForbiddenError('You cannot deactivate your own account');
      }

      const user = await userService.updateUser(id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { isActive } = req.body;
      
      if (req.user?.id === id) {
        throw new ForbiddenError('You cannot modify your own account status');
      }

      const user = await userService.updateStatus(id, isActive);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
