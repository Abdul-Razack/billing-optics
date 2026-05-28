import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/lib/stock";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface ProductStatusBadgeProps {
  status?: StockStatus;
  isActive?: boolean;
  type: "stock" | "active";
}

export function ProductStatusBadge({ status, isActive, type }: ProductStatusBadgeProps) {
  if (type === "active") {
    if (isActive) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">Inactive</Badge>;
  }

  if (type === "stock" && status) {
    switch (status) {
      case "IN_STOCK":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        );
      case "LOW_STOCK":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Low Stock
          </Badge>
        );
      case "OUT_OF_STOCK":
        return (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
      default:
        return null;
    }
  }

  return null;
}
