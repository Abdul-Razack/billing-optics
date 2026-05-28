import { Request, Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';

const getFilename = (prefix: string) => {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-report-${date}.csv`;
};

const sendCsvResponse = (res: Response, filename: string, csvContent: string) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
};

export class ExportController {
  static async exportSales(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      const status = req.query.status as string;

      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const csvContent = await ExportService.exportSales(startDate, endDate, status);
      sendCsvResponse(res, getFilename('sales'), csvContent);
    } catch (error) {
      next(error);
    }
  }

  static async exportInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryIdStr = req.query.categoryId as string;
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;

      const csvContent = await ExportService.exportInventory(categoryId);
      sendCsvResponse(res, getFilename('inventory'), csvContent);
    } catch (error) {
      next(error);
    }
  }

  static async exportCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      const status = req.query.status as string;

      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const csvContent = await ExportService.exportCustomers(startDate, endDate, status);
      sendCsvResponse(res, getFilename('customers'), csvContent);
    } catch (error) {
      next(error);
    }
  }

  static async exportPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      const method = req.query.method as string;

      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const csvContent = await ExportService.exportPayments(startDate, endDate, method);
      sendCsvResponse(res, getFilename('payments'), csvContent);
    } catch (error) {
      next(error);
    }
  }
}
