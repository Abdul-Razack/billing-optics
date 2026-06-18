import { ReportRepository } from '../repositories/report.repository';
import { ValidationError } from '../utils/errors';

export class ReportService {
  static async getSalesReport(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getSalesAnalytics(startDate, endDate);
  }

  static async getRevenueTrend(startDate: Date, endDate: Date, groupBy: 'daily' | 'weekly' | 'monthly') {
    if (startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getRevenueTrend(startDate, endDate, groupBy);
  }

  static async getInventoryReport(categoryId?: number, stockStatus?: string, startDate?: Date, endDate?: Date) {
    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getInventoryAnalytics(categoryId, stockStatus, startDate, endDate);
  }

  static async getCustomerReport(customerType?: string, frequency?: string, startDate?: Date, endDate?: Date) {
    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getCustomerAnalytics(customerType, frequency, startDate, endDate);
  }

  static async getLowStockReport() {
    return await ReportRepository.getProductsBelowStockThreshold();
  }

  static async getPaymentSummary(startDate: Date, endDate: Date) {
    return await ReportRepository.getPaymentTotalsByMethod(startDate, endDate);
  }

  static async getDailyStatement(date: Date) {
    return await ReportRepository.getDailyStatement(date);
  }
}
