"use client";

import { Badge } from "@/components/ui/badge";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

interface StockStatusBadgeProps {
  status: StockStatus;
}

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  switch (status) {
    case "IN_STOCK":
      return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20">In Stock</Badge>;
    case "LOW_STOCK":
      return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20">Low Stock</Badge>;
    case "OUT_OF_STOCK":
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20">Out of Stock</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
