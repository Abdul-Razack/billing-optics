export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockCalculationResult {
  currentStock: number;
  status: StockStatus;
}

export function calculateStockStatus(
  currentStock: number | undefined | null,
  minStockAlert: number | undefined | null
): StockCalculationResult {
  const stock = currentStock ?? 0;
  const min = minStockAlert ?? 5;
  
  let status: StockStatus = "IN_STOCK";
  
  if (stock <= 0) {
    status = "OUT_OF_STOCK";
  } else if (stock <= min) {
    status = "LOW_STOCK";
  }
  
  return {
    currentStock: stock,
    status
  };
}
