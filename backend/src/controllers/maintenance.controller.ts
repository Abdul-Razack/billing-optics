import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { AuditService } from '../services/audit.service';
import { AppError } from '../utils/errors';

export class MaintenanceController {
  static async getTableStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await MaintenanceService.getTableStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to retrieve table statistics', error.message));
    }
  }

  static async optimizeDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MaintenanceService.performOptimization();
      
      await AuditService.logEvent({
        userId: req.user?.id,
        action: 'OPTIMIZE_DATABASE',
        module: 'SYSTEM',
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Database optimization (VACUUM ANALYZE) completed successfully.',
        data: result,
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to optimize database', error.message));
    }
  }

  static async verifyBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.body;
      if (!filename) {
        return next(new AppError(400, 'Filename is required for backup verification.'));
      }

      const result = await MaintenanceService.verifyBackupIntegrity(filename);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to verify backup integrity', error.message));
    }
  }

  static async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await MaintenanceService.getTableStats();
      
      const fileContent = JSON.stringify(stats, null, 2);
      const filename = `db_maintenance_report_${new Date().getTime()}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(fileContent);
    } catch (error: any) {
      next(new AppError(500, 'Failed to export maintenance report', error.message));
    }
  }
}
