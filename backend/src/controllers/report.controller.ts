import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
      const endDate = endDateStr ? new Date(endDateStr) : new Date();

      const result = await ReportService.getSalesReport(startDate, endDate);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getLowStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const thresholdQuery = req.query.threshold as string;
      const parsedThreshold = thresholdQuery ? parseInt(thresholdQuery, 10) : 10;
      const threshold = isNaN(parsedThreshold) ? 10 : parsedThreshold;

      const result = await ReportService.getLowStockReport(threshold);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
      const endDate = endDateStr ? new Date(endDateStr) : new Date();

      const result = await ReportService.getPaymentSummary(startDate, endDate);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
