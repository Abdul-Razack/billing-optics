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

      // 1. Fetch old values for audit
      const oldValues = await PrescriptionService.getPrescriptionById(id);
      if (!oldValues) {
        throw new NotFoundError('Prescription not found');
      }

      // 2. Perform update
      const result = await PrescriptionService.updatePrescription(id, req.body);
      
      // 3. Log Audit Event
      const { AuditService } = require('../services/audit.service');
      await AuditService.logEvent({
        userId: req.user!.id,
        action: 'UPDATE',
        module: 'PRESCRIPTION',
        recordId: id.toString(),
        oldValues,
        newValues: result,
        req
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ValidationError('Invalid ID');
      }

      const { db } = require('../config/db');
      const { auditLogs, users } = require('../db/schema');
      const { eq, and, desc } = require('drizzle-orm');

      const logs = await db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        createdAt: auditLogs.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(and(
        eq(auditLogs.module, 'PRESCRIPTION'),
        eq(auditLogs.recordId, id.toString())
      ))
      .orderBy(desc(auditLogs.createdAt));

      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}
