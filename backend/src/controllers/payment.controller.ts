import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.getPayments(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
