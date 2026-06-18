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

  static async getInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryIdStr = req.query.categoryId as string;
      const stockStatus = req.query.stockStatus as string;
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const result = await ReportService.getInventoryReport(categoryId, stockStatus, startDate, endDate);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getLowStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReportService.getLowStockReport();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerReport(req: Request, res: Response, next: NextFunction) {
    try {
      const customerType = req.query.customerType as string;
      const frequency = req.query.frequency as string;
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const result = await ReportService.getCustomerReport(customerType, frequency, startDate, endDate);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      const groupBy = (req.query.groupBy as 'daily' | 'weekly' | 'monthly') || 'daily';
      
      const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
      const endDate = endDateStr ? new Date(endDateStr) : new Date();

      const result = await ReportService.getRevenueTrend(startDate, endDate, groupBy);
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

  static async getDailyStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : new Date();

      const result = await ReportService.getDailyStatement(date);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
