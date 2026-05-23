import { Request, Response, NextFunction } from 'express';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(501).json({ message: 'Not Implemented' });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(501).json({ message: 'Not Implemented' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
