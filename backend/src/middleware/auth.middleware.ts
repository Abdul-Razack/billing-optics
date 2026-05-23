import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { AppError } from '../utils/errors';
import env from '../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(403, message);
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header with Bearer token is required');
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const result = await db
      .select({
        id: users.id,
        isActive: users.isActive,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, Number(decoded.userId)))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenError('User account is inactive');
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

