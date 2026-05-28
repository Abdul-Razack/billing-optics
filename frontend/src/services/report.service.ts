import { fetchClient } from "@/lib/api-client";

export interface SalesReportData {
  kpis: {
    totalSales: number;
    revenue: number;
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    partialInvoices: number;
    averageInvoiceValue: number;
  };
  topCustomers: {
    id: number;
    name: string;
    orderCount: number;
    revenue: number;
  }[];
  topProducts: {
    id: number;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export interface RevenueTrendData {
  label: string;
  sales: number;
}

export interface PaymentSummaryData {
  paymentMethod: string;
  total: number;
}

export interface InventoryReportData {
  kpis: {
    totalProducts: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
    inventoryValue: number;
  };
  categoryBreakdown: {
    category: string;
    stock: number;
    value: number;
  }[];
  movements: {
    stockIn: number;
    stockOut: number;
    adjustments: number;
  };
}

export interface CustomerReportData {
  kpis: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
  };
  segmentationData: {
    name: string;
    value: number;
    color: string;
  }[];
  growthTrendData: {
    label: string;
    customers: number;
  }[];
  topCustomersData: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    orderCount: number;
    revenue: number;
    lastPurchase: string;
  }[];
}

export class ReportService {
  static async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports/sales?${queryString}` : `/reports/sales`;
    
    const response = await fetchClient<{ success: boolean; data: SalesReportData }>(endpoint);
    return response.data;
  }

  static async getRevenueTrend(startDate?: string, endDate?: string, groupBy: string = "daily"): Promise<RevenueTrendData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("groupBy", groupBy);

    const queryString = params.toString();
    const response = await fetchClient<{ success: boolean; data: RevenueTrendData[] }>(`/reports/revenue?${queryString}`);
    return response.data;
  }

  static async getInventoryReport(categoryId?: string, stockStatus?: string, startDate?: string, endDate?: string): Promise<InventoryReportData> {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);
    if (stockStatus && stockStatus !== "all") params.append("stockStatus", stockStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports/inventory?${queryString}` : `/reports/inventory`;
    
    const response = await fetchClient<{ success: boolean; data: InventoryReportData }>(endpoint);
    return response.data;
  }

  static async getLowStockReport(): Promise<any[]> {
    const response = await fetchClient<{ success: boolean; data: any[] }>(`/reports/low-stock`);
    return response.data;
  }

  static async getCustomerReport(customerType?: string, frequency?: string, startDate?: string, endDate?: string): Promise<CustomerReportData> {
    const params = new URLSearchParams();
    if (customerType && customerType !== "all") params.append("customerType", customerType);
    if (frequency && frequency !== "all") params.append("frequency", frequency);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports/customers?${queryString}` : `/reports/customers`;
    
    const response = await fetchClient<{ success: boolean; data: CustomerReportData }>(endpoint);
    return response.data;
  }

  static async getPaymentSummary(startDate?: string, endDate?: string): Promise<PaymentSummaryData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports/payments?${queryString}` : `/reports/payments`;
    
    const response = await fetchClient<{ success: boolean; data: PaymentSummaryData[] }>(endpoint);
    return response.data;
  }
}
