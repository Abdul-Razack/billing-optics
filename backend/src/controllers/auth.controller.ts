import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      
      // Log successful login
      await AuditService.logEvent({
        userId: Number(result.user.id),
        action: 'LOGIN',
        module: 'AUTH',
        req,
        result: 'SUCCESS'
      });

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      // Log failed login
      await AuditService.logEvent({
        userId: null,
        action: 'LOGIN_ATTEMPT',
        module: 'AUTH',
        req,
        result: 'FAILURE',
        details: error.message || 'Login failed'
      });
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

