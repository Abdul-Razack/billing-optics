import { ReportRepository } from '../repositories/report.repository';
import { ValidationError } from '../utils/errors';

export class ReportService {
  static async getSalesReport(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new ValidationError('startDate cannot be after endDate');
    }
    return await ReportRepository.getSalesAggregation(startDate, endDate);
  }

  static async getLowStockReport(threshold: number = 10) {
    return await ReportRepository.getProductsBelowStockThreshold(threshold);
  }

  static async getPaymentSummary(startDate: Date, endDate: Date) {
    return await ReportRepository.getPaymentTotalsByMethod(startDate, endDate);
  }
}
