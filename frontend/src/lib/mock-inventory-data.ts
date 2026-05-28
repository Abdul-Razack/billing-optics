import { InventoryTransaction, StockAlert } from "@/types/inventory";

// Mock data leveraging the product IDs from MOCK_PRODUCTS (prod_1 to prod_6)

export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: "txn_1",
    date: "2023-11-20T09:15:00Z",
    productId: "prod_1", // Ray-Ban Aviator Classic
    type: "SALE",
    quantity: -1,
    referenceId: "INV-2023-1004",
    createdBy: "System",
    notes: "Automatic deduction from invoice"
  },
  {
    id: "txn_2",
    date: "2023-11-19T14:30:00Z",
    productId: "prod_2", // Acuvue Oasys 1-Day
    type: "PURCHASE",
    quantity: 100,
    referenceId: "PO-4492",
    createdBy: "Admin User",
    notes: "Restock from supplier"
  },
  {
    id: "txn_3",
    date: "2023-11-18T11:00:00Z",
    productId: "prod_5", // Microfiber Cleaning Cloth
    type: "ADJUSTMENT",
    quantity: -5,
    referenceId: "ADJ-001",
    createdBy: "Store Manager",
    notes: "Damaged inventory disposed"
  },
  {
    id: "txn_4",
    date: "2023-11-17T16:45:00Z",
    productId: "prod_3", // Zeiss Single Vision
    type: "RETURN",
    quantity: 2,
    referenceId: "RTN-892",
    createdBy: "System",
    notes: "Customer return"
  },
  {
    id: "txn_5",
    date: "2023-11-16T10:20:00Z",
    productId: "prod_4", // Oakley Holbrook
    type: "SALE",
    quantity: -2,
    referenceId: "INV-2023-1001",
    createdBy: "System",
  },
];

export const MOCK_STOCK_ALERTS: StockAlert[] = [
  {
    productId: "prod_4", // Oakley Holbrook (current 3, min 5)
    currentStock: 3,
    minimumStock: 5,
  },
  {
    productId: "prod_1", // Ray-Ban Aviator (current 12, min 15)
    currentStock: 12,
    minimumStock: 15,
  }
];
