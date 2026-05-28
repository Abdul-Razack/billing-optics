import { Request, Response, NextFunction } from 'express';
import { AppError, ConflictError } from '../utils/errors';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Catch standard AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Catch database unique constraint errors (PostgreSQL 23505)
  if (err.code === '23505') {
    res.status(409).json({
      success: false,
      message: 'Resource conflict: a record with these details already exists.',
    });
    return;
  }

  // Log unhandled errors internally
  console.error('Unhandled Error:', err);

  // Return a safe 500 error for all other cases
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
