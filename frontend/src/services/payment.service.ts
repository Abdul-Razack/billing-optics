import { fetchClient, ApiResponse } from "@/lib/api-client";
import { PaymentMethod } from "@/types/order";

export interface ApiPayment {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
  } | null;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export class PaymentService {
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
  }): Promise<{ data: ApiPayment[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, value.toString());
        }
      });
    }
    
    const queryString = query.toString();
    const endpoint = queryString ? `/payments?${queryString}` : "/payments";
    
    const response = await fetchClient<ApiResponse<ApiPayment[]>>(endpoint);
    return { 
      data: response.data, 
      total: response.meta?.totalRecords || 0,
      page: response.meta?.currentPage || 1,
      totalPages: response.meta?.totalPages || 1
    };
  }
}
