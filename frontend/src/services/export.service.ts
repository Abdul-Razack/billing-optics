import { downloadFile } from "@/lib/api-client";

export class ExportService {
  static async exportSalesCsv(startDate?: string, endDate?: string, status?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (status && status !== "all") params.append("status", status);

    const qs = params.toString();
    const endpoint = qs ? `/exports/sales.csv?${qs}` : `/exports/sales.csv`;
    
    // The server provides a nice filename, but we can provide a fallback if needed
    const filename = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(endpoint, filename);
  }

  static async exportInventoryCsv(categoryId?: string) {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);

    const qs = params.toString();
    const endpoint = qs ? `/exports/inventory.csv?${qs}` : `/exports/inventory.csv`;
    
    const filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(endpoint, filename);
  }

  static async exportCustomersCsv(startDate?: string, endDate?: string, status?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (status && status !== "all") params.append("status", status);

    const qs = params.toString();
    const endpoint = qs ? `/exports/customers.csv?${qs}` : `/exports/customers.csv`;
    
    const filename = `customers-report-${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(endpoint, filename);
  }

  static async exportPaymentsCsv(startDate?: string, endDate?: string, method?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (method && method !== "all") params.append("method", method);

    const qs = params.toString();
    const endpoint = qs ? `/exports/payments.csv?${qs}` : `/exports/payments.csv`;
    
    const filename = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
    await downloadFile(endpoint, filename);
  }

  static async exportInvoicePdf(invoiceId: string | number) {
    const endpoint = `/billing/${invoiceId}/pdf`;
    const filename = `invoice-${invoiceId}.pdf`;
    await downloadFile(endpoint, filename);
  }
}
