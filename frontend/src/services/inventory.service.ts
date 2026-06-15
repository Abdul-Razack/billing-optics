import { fetchClient, ApiResponse } from "@/lib/api-client";

export interface InventoryHistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  sort?: "newest" | "oldest";
}

export interface InventoryLedgerRecord {
  id: number;
  productId: number;
  movementType: string;
  quantityChange: number;
  referenceId: number | null;
  notes: string | null;
  createdAt: string;
  createdBy: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  creator?: {
    id: number;
    fullName: string;
  };
}

export interface InventoryHistoryResponse {
  records: InventoryLedgerRecord[];
  pagination: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface AdjustStockPayload {
  productId: number;
  adjustmentType: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  notes?: string;
  referenceId?: number;
}

export class InventoryService {
  static async adjustStock(payload: AdjustStockPayload): Promise<{ entry: InventoryLedgerRecord, newStock: number }> {
    const response = await fetchClient<{ success: boolean; data: { entry: InventoryLedgerRecord, newStock: number } }>("/inventory/adjust", {
      method: "POST",
      data: payload
    });
    if (!response.success) throw new Error("Failed to adjust stock");
    return response.data;
  }

  static async bulkAdjustStock(payload: { adjustments: AdjustStockPayload[] }): Promise<{ successCount: number, failedCount: number, entries: InventoryLedgerRecord[], updatedStockSummary: Record<number, number> }> {
    const response = await fetchClient<{ success: boolean; data: { successCount: number, failedCount: number, entries: InventoryLedgerRecord[], updatedStockSummary: Record<number, number> } }>("/inventory/bulk-adjust", {
      method: "POST",
      data: payload
    });
    if (!response.success) throw new Error("Failed to perform bulk stock adjustment");
    return response.data;
  }

  static async getHistory(query: InventoryHistoryQuery = {}): Promise<InventoryHistoryResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.movementType) params.append("movementType", query.movementType);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);
    if (query.createdBy) params.append("createdBy", query.createdBy.toString());
    if (query.sort) params.append("sort", query.sort);

    const queryString = params.toString();
    const url = `/inventory/history${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchClient<ApiResponse<InventoryLedgerRecord[]>>(url);
    if (!response.success) throw new Error("Failed to fetch inventory history");
    return {
      records: response.data,
      pagination: response.meta ? {
        totalRecords: response.meta.totalRecords,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.currentPage,
        limit: response.meta.pageSize
      } : {
        totalRecords: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      }
    };
  }
}
