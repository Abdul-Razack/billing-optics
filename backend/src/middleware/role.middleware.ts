import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions to access this resource') {
    super(403, message);
  }
}

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
