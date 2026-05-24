export interface InvoiceLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  total: number;
  lineItemIds: string[];
  lines?: InvoiceLine[];
  payments?: import('./payment.types').InvoicePayment[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
}

export interface InventoryStock {
  productId: string;
  availableQuantity: number;
}
