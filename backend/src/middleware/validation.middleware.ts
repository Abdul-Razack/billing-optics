import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.method === 'GET' ? undefined : req.body, // Prevent GET body validation
        query: req.query,
        params: req.params,
      });

      // Apply the parsed, coerced, and defaulted values back to the request
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        // Log validation error safely (diagnostic improvement)
        console.warn(`[Validation Error] ${req.method} ${req.originalUrl}:`, JSON.stringify(errors));

        next(new ValidationError('Validation failed', errors));
        return;
      }
      
      console.error(`[Validation Fatal Error] ${req.method} ${req.originalUrl}:`, error);
      next(new ValidationError('Invalid request data'));
    }
  };
};
