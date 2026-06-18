import { fetchClient, ApiResponse } from "@/lib/api-client";
import { ApiInvoice, PaymentMethod } from "@/types/order";
import { toast } from "sonner";

export interface CheckoutPayload {
  invoiceId?: string;
  customerId?: number;
  items: { productId: number; quantity: number }[];
  offerId?: number;
  loyaltyPointsRedeemed?: number;
  payments?: {
    method: PaymentMethod;
    amount: number;
    reference?: string;
  }[];
}

export class OrderService {
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    deliveryStatus?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<{ data: ApiInvoice[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
          query.append(key, value.toString());
        }
      });
    }
    
    const queryString = query.toString();
    const endpoint = queryString ? `/invoices?${queryString}` : "/invoices";
    
    const response = await fetchClient<ApiResponse<ApiInvoice[]>>(endpoint);
    return { data: response.data, total: response.meta?.totalRecords || 0 };
  }

  /**
   * REAL: Fetch invoice details from backend
   */
  static async getOrderById(id: number | string): Promise<ApiInvoice> {
    try {
      const response = await fetchClient<{ success: boolean; data: ApiInvoice; } | ApiInvoice>(`/invoices/${id}`);
      // Handle both {success: true, data: {...}} and direct {...} responses for backward compatibility returns the object directly, 
      // sometimes wrapped in { success: true, data: ... }
      return (response as any).data || response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Invoice not found");
      }
      throw error;
    }
  }

  /**
   * REAL: Checkout creates an invoice
   */
  static async createOrder(id: string, payload: CheckoutPayload): Promise<{ invoiceId: number; idempotent?: boolean }> {
    const response = await fetchClient<{ success: boolean; data: { invoiceId: number; idempotent?: boolean }; }>(`/invoices/${id}/checkout`, {
      method: "POST",
      data: payload,
    });
    return response.data;
  }

  /**
   * REAL: Add a payment to an existing invoice
   */
  static async addPayment(
    invoiceId: number, 
    payload: { method: PaymentMethod; amount: number; reference?: string }
  ): Promise<ApiInvoice> {
    const response = await fetchClient<{ success: boolean; data: ApiInvoice; }>(`/invoices/${invoiceId}/payments`, {
      method: "POST",
      data: {
        amount: payload.amount,
        paymentMethod: payload.method,
        referenceNumber: payload.reference,
      },
    });
    return response.data;
  }

  /**
   * REAL: Update delivery status
   */
  static async updateDeliveryStatus(id: number, status: string): Promise<ApiInvoice> {
    const response = await fetchClient<{ success: boolean; data: ApiInvoice; }>(`/invoices/${id}/delivery-status`, {
      method: "PUT",
      data: { deliveryStatus: status },
    });
    return response.data;
  }

  /**
   * REAL: Update Order Metadata
   */
  static async updateOrder(id: number, payload: Partial<ApiInvoice>): Promise<ApiInvoice> {
    const response = await fetchClient<{ success: boolean; data: ApiInvoice; }>(`/invoices/${id}`, {
      method: "PUT",
      data: {
        customerId: payload.customerId,
        deliveryStatus: payload.deliveryStatus,
        notes: payload.notes
      },
    });
    return response.data;
  }

  /**
   * REAL: Void Order
   */
  static async voidOrder(id: number): Promise<ApiInvoice> {
    const response = await fetchClient<{ success: boolean; data: ApiInvoice; }>(`/invoices/${id}/void`, {
      method: "POST",
    });
    return response.data;
  }

  /**
   * MOCKED: Bulk delete orders
   */
  static async bulkDeleteOrders(ids: number[]): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`Mock: ${ids.length} orders deleted (No backend support yet)`);
    return true;
  }

  /**
   * MOCKED: Bulk update order status
   */
  static async bulkUpdateOrderStatus(ids: number[], status: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`Mock: ${ids.length} orders updated to ${status} (No backend support yet)`);
    return true;
  }
}
