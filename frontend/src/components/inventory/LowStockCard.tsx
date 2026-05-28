import { StockAlert } from "@/types/inventory";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LowStockCardProps {
  alert: StockAlert;
}

export function LowStockCard({ alert }: LowStockCardProps) {
  const product = MOCK_PRODUCTS.find(p => p.id === alert.productId);

  if (!product) return null;

  return (
    <div className="bg-card rounded-lg border border-red-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{product.name}</h4>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="font-bold text-red-600">{alert.currentStock} in stock</span>
            <span className="text-muted-foreground">(Min: {alert.minimumStock})</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inventory/adjustments/new?product=${product.id}`}>
            Adjust
          </Link>
        </Button>
        <Button size="sm">
          Create PO
        </Button>
      </div>
    </div>
  );
}
