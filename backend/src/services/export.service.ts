import { ExportRepository } from '../repositories/export.repository';
import { generateCsv } from '../utils/csv.util';

export class ExportService {
  static async exportSales(startDate?: Date, endDate?: Date, status?: string): Promise<string> {
    const data = await ExportRepository.getSalesExport(startDate, endDate, status);
    return generateCsv(data);
  }

  static async exportInventory(categoryId?: number): Promise<string> {
    const data = await ExportRepository.getInventoryExport(categoryId);
    return generateCsv(data);
  }

  static async exportCustomers(startDate?: Date, endDate?: Date, status?: string): Promise<string> {
    const data = await ExportRepository.getCustomersExport(startDate, endDate, status);
    return generateCsv(data);
  }

  static async exportPayments(startDate?: Date, endDate?: Date, method?: string): Promise<string> {
    const data = await ExportRepository.getPaymentsExport(startDate, endDate, method);
    return generateCsv(data);
  }
}
