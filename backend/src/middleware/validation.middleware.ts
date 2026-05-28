import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
        return;
      }
      next(new ValidationError('Invalid request data'));
    }
  };
};
