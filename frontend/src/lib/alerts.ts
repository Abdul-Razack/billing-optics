export type AlertSeverity = "WARNING" | "CRITICAL" | "EMERGENCY" | "OK";

export interface StockAlertResult {
  severity: AlertSeverity;
  isAlert: boolean;
}

export function calculateAlertSeverity(currentStock: number, minStockAlert: number | undefined): StockAlertResult {
  const threshold = minStockAlert ?? 0;
  
  // If threshold is 0 and current is 0, technically it's out of stock but
  // if they didn't set a threshold, maybe they don't want alerts?
  // Let's assume threshold defaults to 0 if not set. 
  // If currentStock is 0, it's always an emergency, unless threshold is specifically not set and they don't track it.
  // The system uses minStockAlert to track it.
  
  if (currentStock === 0) {
    return { severity: "EMERGENCY", isAlert: true };
  }
  
  if (currentStock <= threshold / 2) {
    return { severity: "CRITICAL", isAlert: true };
  }
  
  if (currentStock <= threshold) {
    return { severity: "WARNING", isAlert: true };
  }
  
  return { severity: "OK", isAlert: false };
}
