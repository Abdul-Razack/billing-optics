import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service';
import { AppError } from '../utils/errors';

export class HealthController {
  static async getHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const healthData = await HealthService.getSystemHealth();
      res.status(200).json({
        success: true,
        data: healthData,
      });
    } catch (error: any) {
      next(new AppError(500, 'Failed to retrieve system health', error.message));
    }
  }

  static async exportDiagnostics(req: Request, res: Response, next: NextFunction) {
    try {
      const healthData = await HealthService.getSystemHealth();
      
      const fileContent = JSON.stringify(healthData, null, 2);
      const filename = `diagnostics_${new Date().getTime()}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(fileContent);
    } catch (error: any) {
      next(new AppError(500, 'Failed to export diagnostics', error.message));
    }
  }
}
