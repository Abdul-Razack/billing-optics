import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { AppError } from '../utils/errors';

export class AuditController {
  static async getLogs(req: Request, res: Response) {
    try {
      const query = req.query;
      const logs = await AuditService.getLogs(query);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new AppError(500, 'Failed to fetch audit logs');
    }
  }

  static async exportLogs(req: Request, res: Response) {
    try {
      // In a real app we would use csv-stringify or similar, 
      // but for this implementation we will return all filtered records as JSON
      const query = { ...req.query, limit: 10000 }; // Increase limit for export
      const logs = await AuditService.getLogs(query);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="audit_logs_export.json"');
      res.json(logs.data);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw new AppError(500, 'Failed to export audit logs');
    }
  }
}
