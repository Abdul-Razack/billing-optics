import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !req.user.role) {
        throw new ForbiddenError();
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
