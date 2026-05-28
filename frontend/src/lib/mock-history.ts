export type MovementType = "ADD" | "REDUCE" | "REPLACE" | "DAMAGE" | "TRANSFER";

export interface StockMovement {
  id: string;
  productId: number;
  productName: string;
  productSku: string;
  type: MovementType;
  previousQuantity: number;
  changeQuantity: number;
  newQuantity: number;
  reason: string;
  notes?: string;
  timestamp: string;
  performedBy: string;
}

// Generate some mock history data
export function generateMockHistory(count: number = 50): StockMovement[] {
  const users = ["Admin User", "John Doe", "Jane Smith"];
  const reasons = {
    ADD: ["Supplier Restock", "Inventory Count Correction", "Return"],
    REDUCE: ["Sales Order", "Internal Use"],
    REPLACE: ["Cycle Count", "Audit"],
    DAMAGE: ["Damaged in transit", "Broken in warehouse"],
    TRANSFER: ["Transfer to Store B", "Transfer from Warehouse C"]
  };
  const products = [
    { id: 1, name: "Aviator Sunglasses", sku: "AV-100" },
    { id: 2, name: "Reading Glasses 2.0", sku: "RG-200" },
    { id: 3, name: "Contact Lenses - Daily", sku: "CL-D" },
    { id: 4, name: "Lens Cleaner Solution", sku: "LC-50" },
    { id: 5, name: "Premium Frames", sku: "PF-99" }
  ];

  const history: StockMovement[] = [];
  let currentDate = new Date();

  for (let i = 0; i < count; i++) {
    // Generate dates going backwards in time
    currentDate = new Date(currentDate.getTime() - Math.random() * 100000000);
    
    const product = products[Math.floor(Math.random() * products.length)];
    const types: MovementType[] = ["ADD", "REDUCE", "REPLACE", "DAMAGE", "TRANSFER"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const prev = Math.floor(Math.random() * 100);
    let change = Math.floor(Math.random() * 20) + 1;
    let newQty = 0;

    if (type === "ADD") newQty = prev + change;
    else if (type === "REDUCE" || type === "DAMAGE" || type === "TRANSFER") {
      change = Math.min(change, prev);
      newQty = prev - change;
    }
    else if (type === "REPLACE") {
      newQty = Math.floor(Math.random() * 100);
      change = newQty - prev;
    }

    const typeReasons = reasons[type];
    const reason = typeReasons[Math.floor(Math.random() * typeReasons.length)];

    history.push({
      id: `MOV-${10000 + i}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type,
      previousQuantity: prev,
      changeQuantity: type === "REPLACE" ? change : (type === "ADD" ? change : -change),
      newQuantity: newQty,
      reason,
      timestamp: currentDate.toISOString(),
      performedBy: users[Math.floor(Math.random() * users.length)]
    });
  }

  return history;
}

// Simulated backend query function
export async function getMockStockHistory(
  page: number, 
  pageSize: number, 
  searchQuery: string, 
  typeFilter: string
): Promise<{ data: StockMovement[], total: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Note: normally this mock data would be in a store, but for this demo 
  // we'll just deterministically generate a large list once and filter it
  const allHistory = generateMockHistory(120);

  let filtered = [...allHistory];
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.productName.toLowerCase().includes(q) || 
      item.productSku.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  }

  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter(item => item.type === typeFilter);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total };
}
