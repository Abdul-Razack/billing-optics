import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await CustomerService.create(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getAll();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await CustomerService.getById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      const result = await CustomerService.update(id, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async addPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.id, 10);
      const data = req.body;
      const result = await CustomerService.addPrescription(customerId, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
