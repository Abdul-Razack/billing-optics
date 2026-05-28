import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/types/product";

interface ProductStatusBadgeProps {
  status?: StockStatus;
  isActive?: boolean;
  type: "stock" | "active";
}

export function ProductStatusBadge({ status, isActive, type }: ProductStatusBadgeProps) {
  if (type === "active") {
    if (isActive) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
  }

  if (type === "stock" && status) {
    switch (status) {
      case "IN_STOCK":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Stock</Badge>;
      case "LOW_STOCK":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
      case "OUT_OF_STOCK":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>;
      default:
        return null;
    }
  }

  return null;
}
