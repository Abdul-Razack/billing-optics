export type TransactionType = "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";

export interface InventoryTransaction {
  id: string;
  date: string;
  productId: string;
  type: TransactionType;
  quantity: number; // positive for addition, negative for reduction
  referenceId?: string; // invoice ID, PO ID, or adjustment ID
  createdBy: string;
  notes?: string;
}

export interface StockAlert {
  productId: string;
  currentStock: number;
  minimumStock: number;
}
