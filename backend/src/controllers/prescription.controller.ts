import { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '../services/prescription.service';
import { NotFoundError, ValidationError } from '../utils/errors';

export class PrescriptionController {
  static async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PrescriptionService.getPrescriptions(req.query);
      res.status(200).json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError('Invalid ID');
      }
      const result = await PrescriptionService.getPrescriptionById(id);
      if (!result) {
        throw new NotFoundError('Prescription not found');
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptionsByCustomerId(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = parseInt(req.params.customerId, 10);
      if (isNaN(customerId)) {
        throw new ValidationError('Invalid Customer ID');
      }
      const result = await PrescriptionService.getPrescriptionsByCustomerId(customerId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user!.id,
      };
      const result = await PrescriptionService.createPrescription(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updatePrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError('Invalid ID');
      }
      const result = await PrescriptionService.updatePrescription(id, req.body);
      if (!result) {
        throw new NotFoundError('Prescription not found');
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
